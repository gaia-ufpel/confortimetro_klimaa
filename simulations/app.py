import os
import json
import threading
from multiprocessing import Process
import tkinter as tk
from tkinter import Tk, Label, Entry, Button, filedialog, ttk, Frame
from tkinter import messagebox

from simulation import Simulation
from simulation_config import SimulationConfig

class SimulationGUI(tk.Tk):
    def __init__(self, config_path="config.json"):
        super().__init__()

        self._build()        

        self.config_path = config_path
        self.configs = SimulationConfig.from_json(config_path)
        self.show_configs()

    def _build(self):
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

        paths_frame = self._build_path_config()
        paths_frame.grid(row=0, column=0, columnspan=2)

        simulation_frame = self._build_simulation_config()
        simulation_frame.grid(row=1, column=0, columnspan=2, padx=30, pady=30)

        # Save button
        self.save_button = ttk.Button(self, text="Salvar", width=20, command=self.save_configs)
        self.save_button.grid(row=2, column=0)

        # Run button
        self.run_button = ttk.Button(self, text="Executar", width=60, command=self.run)
        self.run_button.grid(row=2, column=1)

    def _build_path_config(self):
        paths_frame = ttk.Frame(master=self)

        # Input file
        ttk.Label(paths_frame, text="Arquivo IDF:", justify="left").grid(row=0, column=0)
        ttk.Button(paths_frame, text="Procurar", width=10, command=self.browse_idf).grid(row=0, column=1, rowspan=2)
        self.inputfile_entry = ttk.Entry(paths_frame, width=60)
        self.inputfile_entry.grid(row=1, column=0)

        # Output folder
        ttk.Label(paths_frame, text="Diretório de saída:", justify="left").grid(row=2, column=0)
        ttk.Button(paths_frame, text="Procurar", width=10, command=self.browse_output).grid(row=2, column=1, rowspan=2)
        self.outputfolder_entry = ttk.Entry(paths_frame, width=60)
        self.outputfolder_entry.grid(row=3, column=0)

        # Weather file
        ttk.Label(paths_frame, text="Arquivo EPW:", anchor="w", justify="left").grid(row=4, column=0)
        ttk.Button(paths_frame, text="Procurar", width=10, command=self.browse_weather).grid(row=4, column=1, rowspan=2)
        self.epwfile_entry = ttk.Entry(paths_frame, width=60)
        self.epwfile_entry.grid(row=5, column=0)

        return paths_frame

    def _build_simulation_config(self):
        simulation_frame = ttk.Frame(master=self)

        # PMV lowerbound
        ttk.Label(simulation_frame, text="PMV Min:").grid(row=6, column=0)
        self.pmv_lowerbound_entry = ttk.Entry(simulation_frame, width=10)
        self.pmv_lowerbound_entry.grid(row=7, column=0)

        # PMV upperbound
        ttk.Label(master=simulation_frame, text="PMV Max:").grid(row=6, column=1)
        self.pmv_upperbound_entry = ttk.Entry(simulation_frame, width=10)
        self.pmv_upperbound_entry.grid(row=7, column=1)

        # Velocity max
        ttk.Label(simulation_frame, text="Velocidade Max:").grid(row=6, column=2)
        self.vel_max_entry = ttk.Entry(simulation_frame, width=10)
        self.vel_max_entry.grid(row=7, column=2)

        # Adaptative
        ttk.Label(simulation_frame, text="Margem Adaptativo:").grid(row=6, column=3)
        self.selected_adaptative = tk.StringVar()
        self.cbx_adaptative = ttk.Combobox(simulation_frame, textvariable=self.selected_adaptative, width=10)
        self.cbx_adaptative["values"] = ("80%", "90%")
        self.cbx_adaptative["state"] = "readonly"
        self.cbx_adaptative.grid(row=7, column=3)

        # Temperature ac min
        ttk.Label(simulation_frame, text="Temperatura AC Min:").grid(row=8, column=0)
        self.temp_ac_min_entry = ttk.Entry(simulation_frame, width=10)
        self.temp_ac_min_entry.grid(row=9, column=0)

        # Temperature ac max
        ttk.Label(simulation_frame, text="Temperatura AC Max:").grid(row=8, column=1)
        self.temp_ac_max_entry = ttk.Entry(simulation_frame, width=10)
        self.temp_ac_max_entry.grid(row=9, column=1)

        # Met
        ttk.Label(simulation_frame, text="Met:").grid(row=8, column=2)
        self.met_entry = ttk.Entry(simulation_frame, width=10)
        self.met_entry.grid(row=9, column=2)

        # Wme
        ttk.Label(simulation_frame, text="Wme:").grid(row=8, column=3)
        self.wme_entry = ttk.Entry(simulation_frame, width=10)
        self.wme_entry.grid(row=9, column=3)

        # Confort bound
        ttk.Label(simulation_frame, text="Banda de conforto:").grid(row=10, column=0)
        self.comfort_bound_entry = ttk.Entry(simulation_frame, width=10)
        self.comfort_bound_entry.grid(row=11, column=0)

        # CO2 limit
        ttk.Label(simulation_frame, text="Limite CO2:").grid(row=10, column=1)
        self.co2_limit_entry = ttk.Entry(simulation_frame, width=10)
        self.co2_limit_entry.grid(row=11, column=1)

        # Air speed delta
        ttk.Label(simulation_frame, text="Variação da vel. ventilação:").grid(row=10, column=2)
        self.air_speed_delta_entry = ttk.Entry(simulation_frame, width=10)
        self.air_speed_delta_entry.grid(row=11, column=2)

        # Temp open window bound
        ttk.Label(simulation_frame, text="Margem temp. abertura janela:").grid(row=10, column=3)
        self.temp_open_window_bound_entry = ttk.Entry(simulation_frame, width=10)
        self.temp_open_window_bound_entry.grid(row=11, column=3)

        # Rooms
        ttk.Label(simulation_frame, text="Rooms:").grid(row=12, column=0)
        self.rooms_entry = ttk.Entry(simulation_frame, width=50)
        self.rooms_entry.grid(row=13, column=1, columnspan=3)

        return simulation_frame

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

    def show_configs(self):
        self.inputfile_entry.insert(0, self.configs.idf_path)
        self.outputfolder_entry.insert(0, self.configs.output_path)
        self.epwfile_entry.insert(0, self.configs.epw_path)
        self.pmv_upperbound_entry.insert(0, self.configs.pmv_upperbound)
        self.pmv_lowerbound_entry.insert(0, self.configs.pmv_lowerbound)
        self.vel_max_entry.insert(0, self.configs.max_vel)
        if self.configs.adaptative_bound == 2.5:
            self.selected_adaptative.set("90%")
        else:
            self.selected_adaptative.set("80%")
        self.temp_ac_min_entry.insert(0, self.configs.temp_ac_min)
        self.temp_ac_max_entry.insert(0, self.configs.temp_ac_max)
        self.met_entry.insert(0, self.configs.met)
        self.wme_entry.insert(0, self.configs.wme)
        self.comfort_bound_entry.insert(0, self.configs.pmv_comfort_bound)
        self.co2_limit_entry.insert(0, self.configs.co2_limit)
        self.air_speed_delta_entry.insert(0, self.configs.air_speed_delta)
        self.temp_open_window_bound_entry.insert(0, self.configs.temp_open_window_bound)
        self.rooms_entry.insert(0, ",".join(self.configs.rooms))

    def update_configs(self):
        self.configs.idf_path = self.inputfile_entry.get()
        self.configs.output_path = self.outputfolder_entry.get()
        self.configs.epw_path = self.epwfile_entry.get()
        self.configs.pmv_upperbound = float(self.pmv_upperbound_entry.get())
        self.configs.pmv_lowerbound = float(self.pmv_lowerbound_entry.get())
        self.configs.max_vel = float(self.vel_max_entry.get())
        if self.selected_adaptative.get() == "80%":
            self.configs.adaptative_bound = 3.5
        else:
            self.configs.adaptative_bound = 2.5
        self.configs.temp_ac_min = float(self.temp_ac_min_entry.get())
        self.configs.temp_ac_max = float(self.temp_ac_max_entry.get())
        self.configs.met = float(self.met_entry.get())
        self.configs.wme = float(self.wme_entry.get())
        self.configs.co2_limit = float(self.co2_limit_entry.get())
        self.configs.air_speed_delta = float(self.air_speed_delta_entry.get())
        self.configs.temp_open_window_bound = float(self.temp_open_window_bound_entry.get())
        self.configs.rooms = self.rooms_entry.get().split(',')

    def save_configs(self):
        self.update_configs()
        self.configs.to_json(self.config_path)

    def run(self):
        if self.run_button['state'] == tk.DISABLED:
            return None
        
        self.update_configs()

        if not os.path.exists(self.configs.input_path):
            tk.messagebox.showerror("Erro", "Arquivo IDF não encontrado!")
            return None

        if not os.path.exists(self.configs.epw_path):
            tk.messagebox.showerror("Erro", "Arquivo EPW não encontrado!")
            return None
        
        if not os.path.exists(self.configs.energy_path):
            tk.messagebox.showerror("Erro", "Pasta do EnergyPlus não existe!")
            return None

        simulation = Simulation(self.configs)

        self.run_button["state"] = tk.DISABLED
        self.run_button["cursor"] = "watch"

        try:
            simulation.run()
        except Exception as ex:
            tk.messagebox.showerror("Erro", f"Erro ao rodar simulação: {ex}")
        finally:
            self.run_button["state"] = tk.NORMAL
            self.run_button["cursor"] = "arrow"

if __name__ == "__main__":
    window = SimulationGUI()
    window.mainloop()