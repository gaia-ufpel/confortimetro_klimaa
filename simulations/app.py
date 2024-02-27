import os
import json
import threading
from multiprocessing import Process
import tkinter as tk
from tkinter import Tk, Label, Entry, Button, filedialog, ttk, Frame
from tkinter import messagebox

from simulation import Simulation
from simulation import ENERGY_PATH

CONFIGS_PATH = "./config.json"

class SimulationGUI(tk.Tk):
    def __init__(self, config_path="./config.json"):
        super().__init__()

        self.title("EnergyPlus Simulações Customizadas")
        self.config(padx=10, pady=100)
        self.configure(background="#cdb4db")

        self.style = ttk.Style()
        self.style.theme_use("default")

        # Change the background color of the self
        self.style.configure("TFrame", background="#cdb4db")
        self.style.configure("TLabel", background="#cdb4db", foreground="#222")
        self.style.configure("TButton", background="#a2d2ff", foreground="#222")
        self.style.configure("TEntry", foreground="#222")

        self.locations_frame = ttk.Frame(master=self)
        self.locations_frame.grid(row=0, column=0, columnspan=2)

        # Input file
        self.lbl_idf = ttk.Label(self.locations_frame, text="Arquivo IDF:", justify="left")
        self.lbl_idf.grid(row=0, column=0)

        ttk.Button(self.locations_frame, 
                text="Procurar", 
                width=10,
                command=self.browse_idf
                ).grid(row=0, column=1, rowspan=2)
        
        self.inputfile_entry = ttk.Entry(self.locations_frame, width=60)
        self.inputfile_entry.grid(row=1, column=0)

        # Output folder
        ttk.Label(self.locations_frame, text="Diretório de saída:", justify="left").grid(row=2, column=0)
        ttk.Button(self.locations_frame, text="Procurar", width=10, command=self.browse_output).grid(row=2, column=1, rowspan=2)
        self.outputfolder_entry = ttk.Entry(self.locations_frame, width=60)
        self.outputfolder_entry.grid(row=3, column=0)

        # Weather file
        ttk.Label(self.locations_frame, text="Arquivo EPW:", anchor="w", justify="left").grid(row=4, column=0)
        ttk.Button(self.locations_frame, text="Procurar", width=10, command=self.browse_weather).grid(row=4, column=1, rowspan=2)
        self.epwfile_entry = ttk.Entry(self.locations_frame, width=60)
        self.epwfile_entry.grid(row=5, column=0)

        self.simu_frame = ttk.Frame(master=self)
        self.simu_frame.grid(row=1, column=0, columnspan=2, padx=30, pady=30)

        # PMV lowerbound
        ttk.Label(self.simu_frame, text="PMV Min:").grid(row=6, column=0)
        self.pmv_lowerbound_entry = ttk.Entry(self.simu_frame, width=10)
        self.pmv_lowerbound_entry.grid(row=7, column=0)

        # PMV upperbound
        ttk.Label(master=self.simu_frame, text="PMV Max:").grid(row=6, column=1)
        self.pmv_upperbound_entry = ttk.Entry(self.simu_frame, width=10)
        self.pmv_upperbound_entry.grid(row=7, column=1)

        # Velocity max
        ttk.Label(self.simu_frame, text="Velocidade Max:").grid(row=6, column=2)
        self.vel_max_entry = ttk.Entry(self.simu_frame, width=10)
        self.vel_max_entry.grid(row=7, column=2)

        # Adaptative
        ttk.Label(self.simu_frame, text="Margem Adaptativo:").grid(row=6, column=3)
        self.selected_adaptative = tk.StringVar()
        self.cbx_adaptative = ttk.Combobox(self.simu_frame, textvariable=self.selected_adaptative, width=10)
        self.cbx_adaptative["values"] = ("80%", "90%")
        self.cbx_adaptative["state"] = "readonly"
        self.cbx_adaptative.grid(row=7, column=3)

        # Temperature ac min
        ttk.Label(self.simu_frame, text="Temperatura AC Min:").grid(row=8, column=0)
        self.temp_ac_min_entry = ttk.Entry(self.simu_frame, width=10)
        self.temp_ac_min_entry.grid(row=9, column=0)

        # Temperature ac max
        ttk.Label(self.simu_frame, text="Temperatura AC Max:").grid(row=8, column=1)
        self.temp_ac_max_entry = ttk.Entry(self.simu_frame, width=10)
        self.temp_ac_max_entry.grid(row=9, column=1)

        # Met
        ttk.Label(self.simu_frame, text="Met:").grid(row=8, column=2)
        self.met_entry = ttk.Entry(self.simu_frame, width=10)
        self.met_entry.grid(row=9, column=2)

        # Wme
        ttk.Label(self.simu_frame, text="Wme:").grid(row=8, column=3)
        self.wme_entry = ttk.Entry(self.simu_frame, width=10)
        self.wme_entry.grid(row=9, column=3)

        # Rooms
        ttk.Label(self.simu_frame, text="Rooms:").grid(row=10, column=0)
        self.rooms_entry = ttk.Entry(self.simu_frame, width=50)
        self.rooms_entry.grid(row=10, column=1, columnspan=3)

        # Save button
        self.save_button = ttk.Button(self, text="Salvar", width=20, command=self.save_configs)
        self.save_button.grid(row=2, column=0)

        # Run button
        self.run_button = ttk.Button(self, text="Executar", width=60, command=self.run)
        self.run_button.grid(row=2, column=1)

        self.config_path = config_path
        self.configs = self.load_configs()
        self.show_configs()

    def browse_idf(self):
        filename = filedialog.askopenfilename(initialdir = ".", title = "Select IDF File", filetypes = (("IDF Files","*.idf"),("all files","*.*")))
        self.inputfile_entry.delete(0, 'end')
        self.inputfile_entry.insert(0, filename)

    def browse_output(self):
        filename = filedialog.askdirectory(initialdir = ".", title = "Select Output Folder")
        self.outputfolder_entry.delete(0, 'end')
        self.outputfolder_entry.insert(0, filename)

    def browse_weather(self):
        filename = filedialog.askopenfilename(initialdir = ".", title = "Select Weather File", filetypes = (("EPW Files","*.epw"),("all files","*.*")))
        self.epwfile_entry.delete(0, 'end')
        self.epwfile_entry.insert(0, filename)

    def load_configs(self):
        content = ""
        with open(CONFIGS_PATH, "r") as reader:
            content = reader.read()

        content = json.loads(content)

        content["rooms"] = ";".join(content["rooms"])

        return content

    def save_configs(self):
        self.configs = {
            "idf_path": self.inputfile_entry.get(),
            "output_path": self.outputfolder_entry.get(),
            "epw_path": self.epwfile_entry.get(),
            "energy_path": ENERGY_PATH,
            "pmv_upperbound": self.pmv_upperbound_entry.get(),
            "pmv_lowerbound": self.pmv_lowerbound_entry.get(),
            "vel_max": self.vel_max_entry.get(),
            "margem_adaptativo": self.selected_adaptative.get(),
            "temp_ac_min": self.temp_ac_min_entry.get(),
            "temp_ac_max": self.temp_ac_max_entry.get(),
            "met": self.met_entry.get(),
            "wme": self.wme_entry.get(),
            "rooms": self.rooms_entry.get().upper().split(";")
        }

        with open(self.config_path, "w") as writer:
            writer.write(json.dumps(self.configs))

    def show_configs(self):
        self.inputfile_entry.insert(0, self.configs["idf_path"])
        self.outputfolder_entry.insert(0, self.configs["output_path"])
        self.epwfile_entry.insert(0, self.configs["epw_path"])
        self.pmv_upperbound_entry.insert(0, self.configs["pmv_upperbound"])
        self.pmv_lowerbound_entry.insert(0, self.configs["pmv_lowerbound"])
        self.vel_max_entry.insert(0, self.configs["vel_max"])
        self.selected_adaptative.set(self.configs["margem_adaptativo"])
        self.temp_ac_min_entry.insert(0, self.configs["temp_ac_min"])
        self.temp_ac_max_entry.insert(0, self.configs["temp_ac_max"])
        self.met_entry.insert(0, self.configs["met"])
        self.wme_entry.insert(0, self.configs["wme"])
        self.rooms_entry.insert(0, self.configs["rooms"])

    def run(self):
        if self.run_button['state'] == tk.DISABLED:
            return None
        
        inputfile = self.inputfile_entry.get()
        if not os.path.exists(inputfile):
            tk.messagebox.showerror("Erro", "Arquivo IDF não encontrado!")
            return None
        
        output_path = self.outputfolder_entry.get()

        epwfile = self.epwfile_entry.get()
        if not os.path.exists(epwfile):
            tk.messagebox.showerror("Erro", "Arquivo EPW não encontrado!")
            return None
        
        epfolder = ENERGY_PATH
        if not os.path.exists(epfolder):
            tk.messagebox.showerror("Erro", "Pasta do EnergyPlus não existe!")
            return None
        
        margem_adaptativo = self.selected_adaptative.get()
        if margem_adaptativo == "80%":
            margem_adaptativo = 3.5
        elif margem_adaptativo == "90%":
            margem_adaptativo = 2.5

        simulation = Simulation(idf_path=self.inputfile_entry.get(),  
                                epw_path=epwfile,
                                output_path=output_path, 
                                energy_path=epfolder, 
                                rooms=self.rooms_entry.get().upper().split(";"), 
                                pmv_upperbound=float(self.pmv_upperbound_entry.get()), 
                                pmv_lowerbound=float(self.pmv_lowerbound_entry.get()), 
                                margem_adaptativo=margem_adaptativo, 
                                vel_max=float(self.vel_max_entry.get()), 
                                temp_ac_min=float(self.temp_ac_min_entry.get()), 
                                temp_ac_max=float(self.temp_ac_max_entry.get()), 
                                met=float(self.met_entry.get()), 
                                wme=float(self.wme_entry.get()),
        )

        self.run_button["state"] = tk.DISABLED
        self.run_button["cursor"] = "watch"

        simulation.run()

        #process = Process(target=simulation.run)
        #process.start()

        #self.popup_running_simple()

        self.run_button["state"] = tk.NORMAL
        self.run_button["cursor"] = "arrow"

    # Custom Pop-up
    def popup_running(self):
        window = tk.Toplevel()
        window.title("Rodando simulação")

        ttk.Label(window, text="Rodando simulação...").grid(row=0, column=0)

    # Simple Pop-up
    def popup_running_simple(self):
        messagebox.showinfo("Rodando simulação", "Rodando simulação...")

if __name__ == "__main__":
    # Create window
    window = SimulationGUI()

    window.mainloop()