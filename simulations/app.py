import os
import json
import threading
import tkinter as tk
from tkinter import Tk, Label, Entry, Button, filedialog, ttk, Frame

from simulations import run_simulation

CONFIGS_PATH = "./config.json"

def browse_idf():
    filename = filedialog.askopenfilename(initialdir = "./", title = "Select IDF File", filetypes = (("IDF Files","*.idf"),("all files","*.*")))
    inputfile_entry.delete(0, 'end')
    inputfile_entry.insert(0, filename)

def browse_output():
    filename = filedialog.askdirectory(initialdir = "./", title = "Select Output Folder")
    inputfile_entry.delete(0, 'end')
    outputfolder_entry.insert(0, filename)

def browse_weather():
    filename = filedialog.askopenfilename(initialdir = "./", title = "Select Weather File", filetypes = (("EPW Files","*.epw"),("all files","*.*")))
    inputfile_entry.delete(0, 'end')
    epwfile_entry.insert(0, filename)

def browse_ep():
    filename = filedialog.askdirectory(initialdir = "./", title = "Select EnergyPlus Folder")
    inputfile_entry.delete(0, 'end')
    epfolder_entry.insert(0, filename)

def load_configs():
    content = ""
    with open(CONFIGS_PATH, "r") as reader:
        content = reader.read()
        
    return json.loads(content)

def save_configs():
    configs = {
        "idf_path": inputfile_entry.get(),
        "output_path": outputfolder_entry.get(),
        "epw_path": epwfile_entry.get(),
        "energy_path": epfolder_entry.get(),
        "pmv_upperbound": pmv_upperbound_entry.get(),
        "pmv_lowerbound": pmv_lowerbound_entry.get(),
        "vel_max": vel_max_entry.get(),
        "temp_ac_min": temp_ac_min_entry.get(),
        "temp_ac_max": temp_ac_max_entry.get(),
        "met": met_entry.get(),
        "wme": wme_entry.get()
    }

    with open(CONFIGS_PATH, "w") as writer:
        writer.write(json.dumps(configs))

def show_configs(configs):
    inputfile_entry.insert(0, configs["idf_path"])
    outputfolder_entry.insert(0, configs["output_path"])
    epwfile_entry.insert(0, configs["epw_path"])
    epfolder_entry.insert(0, configs["energy_path"])
    pmv_upperbound_entry.insert(0, configs["pmv_upperbound"])
    pmv_lowerbound_entry.insert(0, configs["pmv_lowerbound"])
    vel_max_entry.insert(0, configs["vel_max"])
    temp_ac_min_entry.insert(0, configs["temp_ac_min"])
    temp_ac_max_entry.insert(0, configs["temp_ac_max"])
    met_entry.insert(0, configs["met"])
    wme_entry.insert(0, configs["wme"])

def run():
    inputfile = inputfile_entry.get()
    if not os.path.exists(inputfile):
        return None
    
    output_path = outputfolder_entry.get()

    epwfile = epwfile_entry.get()
    if not os.path.exists(epwfile):
        return None
    
    epfolder = epfolder_entry.get()
    if not os.path.exists(epfolder):
        return None

    inputs_path = "/".join(inputfile.split("/")[:-1])

    x = threading.Thread(target=run_simulation, args=(inputs_path, inputfile_entry.get(), f"{inputs_path}/expanded.idf", epwfile, output_path, epfolder, rooms, float(pmv_upperbound_entry.get()), float(pmv_lowerbound_entry.get()), float(vel_max_entry.get()), float(temp_ac_min_entry.get()), float(temp_ac_max_entry.get()), float(met_entry.get()), float(wme_entry.get())))

    x.start()
    x.join()
    #run_simulation(inputs_path, inputfile_entry.get(), f"{inputs_path}/expanded.idf", epwfile, output_path, epfolder, rooms=rooms, pmv_upperbound=float(pmv_upperbound_entry.get()), pmv_lowerbound=float(pmv_lowerbound_entry.get()), vel_max=float(vel_max_entry.get()), temp_ac_min=float(temp_ac_min_entry.get()), temp_ac_max=float(temp_ac_max_entry.get()), met=float(met_entry.get()), wme=float(wme_entry.get()))

if __name__ == "__main__":
    configs = load_configs()

    # Create window
    window = tk.Tk()
    window.title("EnergyPlus Simulações Customizadas")
    window.config(padx=10, pady=100)
    window.configure(background="#cdb4db")

    style = ttk.Style()
    #print(style.theme_names())
    style.theme_use("clam")

    # Change the background color of the window
    style.configure("TFrame", background="#cdb4db")
    style.configure("TLabel", background="#cdb4db", font=("open look cursor", 10), foreground="#222")
    style.configure("TButton", background="#a2d2ff", font=("open look cursor", 10),foreground="#222")
    style.configure("TEntry", font=("open look cursor", 10), foreground="#222")

    # Change the style of the window an all the widgets to something more modern
    #style.configure("clam")
    
    #style.configure()

    locations_frame = ttk.Frame(master=window)
    locations_frame.grid(row=0, column=0, columnspan=2)

    # Input file
    ttk.Label(locations_frame, text="Arquivo IDF:", justify="left").grid(row=0, column=0)
    ttk.Button(locations_frame, text="Procurar", width=10, command=browse_idf).grid(row=0, column=1, rowspan=2)
    inputfile_entry = ttk.Entry(locations_frame, width=60)
    inputfile_entry.grid(row=1, column=0)

    # Output folder
    ttk.Label(locations_frame, text="Diretório de saída:", justify="left").grid(row=2, column=0)
    ttk.Button(locations_frame, text="Procurar", width=10, command=browse_output).grid(row=2, column=1, rowspan=2)
    outputfolder_entry = ttk.Entry(locations_frame, width=60)
    outputfolder_entry.grid(row=3, column=0)

    # Weather file
    ttk.Label(locations_frame, text="Arquivo EPW:", anchor="w", justify="left").grid(row=4, column=0)
    ttk.Button(locations_frame, text="Procurar", width=10, command=browse_weather).grid(row=4, column=1, rowspan=2)
    epwfile_entry = ttk.Entry(locations_frame, width=60)
    epwfile_entry.grid(row=5, column=0)

    # EnergyPlus folder
    ttk.Label(locations_frame, text="Diretório do EnergyPlus:", justify="left").grid(row=6, column=0)
    ttk.Button(locations_frame, text="Procurar", width=10, command=browse_ep).grid(row=6, column=1, rowspan=2)
    epfolder_entry = ttk.Entry(locations_frame, width=60)
    epfolder_entry.grid(row=7, column=0)

    # Rooms
    #rooms_label = Label(text="Rooms:")
    #rooms_label.grid(row=4, column=0)
    #rooms_entry = Entry(width=10)
    #rooms_entry.grid(row=5, column=0)
    rooms = ["SALA"]

    simu_frame = ttk.Frame(master=window)
    simu_frame.grid(row=1, column=0, columnspan=2, padx=30, pady=30)

    # PMV upperbound
    ttk.Label(master=simu_frame, text="PMV Max:").grid(row=6, column=0)
    pmv_upperbound_entry = ttk.Entry(simu_frame, width=10)
    pmv_upperbound_entry.grid(row=7, column=0)

    # PMV lowerbound
    ttk.Label(simu_frame, text="PMV Min:").grid(row=6, column=1)
    pmv_lowerbound_entry = ttk.Entry(simu_frame, width=10)
    pmv_lowerbound_entry.grid(row=7, column=1)

    # Velocity max
    ttk.Label(simu_frame, text="Velocidade Max:").grid(row=6, column=2)
    vel_max_entry = ttk.Entry(simu_frame, width=10)
    vel_max_entry.grid(row=7, column=2)

    # Temperature ac min
    ttk.Label(simu_frame, text="Temperatura AC Min:").grid(row=8, column=0)
    temp_ac_min_entry = ttk.Entry(simu_frame, width=10)
    temp_ac_min_entry.grid(row=9, column=0)

    # Temperature ac max
    ttk.Label(simu_frame, text="Temperatura AC Max:").grid(row=8, column=1)
    temp_ac_max_entry = ttk.Entry(simu_frame, width=10)
    temp_ac_max_entry.grid(row=9, column=1)

    # Met
    ttk.Label(simu_frame, text="Met:").grid(row=8, column=2)
    met_entry = ttk.Entry(simu_frame, width=10)
    met_entry.grid(row=9, column=2)

    # Wme
    ttk.Label(simu_frame, text="Wme:").grid(row=8, column=3)
    wme_entry = ttk.Entry(simu_frame, width=10)
    wme_entry.grid(row=9, column=3)

    # Save button
    save_button = ttk.Button(window, text="Salvar", width=40, command=save_configs)
    save_button.grid(row=2, column=0)

    # Run button
    run_button = ttk.Button(text="Executar", width=40, command=run)
    run_button.grid(row=2, column=1)

    show_configs(configs)

    window.mainloop()