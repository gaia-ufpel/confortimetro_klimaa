import os
import tkinter as tk
from tkinter import Tk, Label, Entry, Button, filedialog, ttk, Frame

from simulations import run_simulation

def browse_idf():
    filename = filedialog.askopenfilename(initialdir = "./assets/inputs", title = "Select IDF File", filetypes = (("IDF Files","*.idf"),("all files","*.*")))
    inputfile_entry.insert(0, filename)

def browse_output():
    filename = filedialog.askdirectory(initialdir = "./assets/outputs", title = "Select Output Folder")
    outputfolder_entry.insert(0, filename)

def browse_weather():
    filename = filedialog.askopenfilename(initialdir = "./assets/inputs", title = "Select Weather File", filetypes = (("EPW Files","*.epw"),("all files","*.*")))
    epwfile_entry.insert(0, filename)

def browse_ep():
    filename = filedialog.askdirectory(initialdir = "./assets/inputs", title = "Select EnergyPlus Folder")
    epfolder_entry.insert(0, filename)

def save_configs():
    pass

def run():
    inputfile = inputfile_label.get()
    if not os.path.exists(inputfile):
        return None

    run_simulation(inputfile_label.get())

if __name__ == "__main__":
    # Create window
    window = tk.Tk()
    window.title("EnergyPlus Simulações Customizadas")
    window.config(padx=10, pady=100)

    locations_frame = tk.Frame(master=window)
    locations_frame.grid(row=0, column=0)

    # Input file
    Label(locations_frame, text="Arquivo IDF:", justify="left").grid(row=0, column=0)
    Button(locations_frame, text="Procurar", width=10, command=browse_idf).grid(row=0, column=1, rowspan=2)
    inputfile_entry = Entry(locations_frame, width=60)
    inputfile_entry.grid(row=1, column=0)

    # Output folder
    Label(locations_frame, text="Diretório de saída:", justify="left").grid(row=2, column=0)
    Button(locations_frame, text="Procurar", width=10, command=browse_output).grid(row=2, column=1)
    outputfolder_entry = Entry(locations_frame, width=60)
    outputfolder_entry.grid(row=3, column=0)

    # Weather file
    Label(locations_frame, text="Arquivo EPW:", anchor="w", justify="left", bg="blue").grid(row=4, column=0)
    Button(locations_frame, text="Procurar", width=10, command=browse_weather).grid(row=4, column=1)
    epwfile_entry = Entry(locations_frame, width=60)
    epwfile_entry.grid(row=5, column=0)

    # EnergyPlus folder
    Label(locations_frame, text="Diretório do EnergyPlus:", justify="left").grid(row=6, column=0)
    Button(locations_frame, text="Procurar", width=10, command=browse_ep).grid(row=6, column=1)
    epfolder_entry = Entry(locations_frame, width=60)
    epfolder_entry.grid(row=7, column=0)

    # Rooms
    #rooms_label = Label(text="Rooms:")
    #rooms_label.grid(row=4, column=0)
    #rooms_entry = Entry(width=10)
    #rooms_entry.grid(row=5, column=0)
    rooms = ["SALA"]

    sep = ttk.Separator(orient="vertical")
    sep.grid(row=0, column=1)

    simu_frame = Frame(master=window)
    simu_frame.grid(row=0, column=2, rowspan=2)

    # PMV upperbound
    tk.Label(master=simu_frame, text="PMV Upperbound:").grid(row=6, column=0)
    pmv_upperbound_entry = Entry(simu_frame, width=10)
    pmv_upperbound_entry.grid(row=7, column=0)

    # PMV lowerbound
    tk.Label(simu_frame, text="PMV Lowerbound:").grid(row=6, column=1)
    pmv_lowerbound_entry = Entry(simu_frame, width=10)
    pmv_lowerbound_entry.grid(row=7, column=1)

    # Velocity max
    Label(simu_frame, text="Velocity Max:").grid(row=6, column=2)
    vel_max_entry = Entry(simu_frame, width=10)
    vel_max_entry.grid(row=7, column=2)

    # Temperature ac min
    Label(simu_frame, text="Temperature AC Min:").grid(row=8, column=0)
    temp_ac_min_entry = Entry(simu_frame, width=10)
    temp_ac_min_entry.grid(row=9, column=0)

    # Temperature ac max
    Label(simu_frame, text="Temperature AC Max:").grid(row=8, column=1)
    temp_ac_max_entry = Entry(simu_frame, width=10)
    temp_ac_max_entry.grid(row=9, column=1)

    # Met
    Label(simu_frame, text="Met:").grid(row=8, column=2)
    met_entry = Entry(simu_frame, width=10)
    met_entry.grid(row=9, column=2)

    # Wme
    Label(simu_frame, text="Wme:").grid(row=8, column=3)
    wme_entry = Entry(simu_frame, width=10)
    wme_entry.grid(row=9, column=3)

    save_button = Button(window, text="Salvar", width=40, command=save_configs)
    save_button.grid(row=1, column=0)

    # Run button
    run_button = Button(text="Run", width=40, command=run)
    run_button.grid(row=1, column=1, columnspan=2)

    window.mainloop()