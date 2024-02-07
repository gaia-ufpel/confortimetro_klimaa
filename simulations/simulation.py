import sys
import os
import platform

from conditioning_pmv import ConditioningPmv
import utils

ENERGY_INFO = "./energy_path.txt"
ENERGY_PATH = ""

with open(ENERGY_INFO, "r") as reader:
    ENERGY_PATH = reader.read()
    sys.path.append(ENERGY_PATH)

from pyenergyplus.api import EnergyPlusAPI

EXPAND_OBJECTS_APP = "ExpandObjects"
TO_CSV_APP = "runreadvars"

if platform.system() == "Windows":
    EXPAND_OBJECTS_APP = "ExpandObjects.exe"
    TO_CSV_APP = "RunReadESO.bat"

class Simulation:
    def __init__(self, idf_path, epw_path, output_path, energy_path, rooms, pmv_upperbound=0.5, pmv_lowerbound=0.0, vel_max=1.35, margem_adaptativo=2.5, temp_ac_min=14.0, temp_ac_max=32.0, met=1.2, wme=0.0):
        self.idf_path = idf_path
        self.input_path = "/".join(idf_path.split('/')[:-1])
        self.expanded_idf_path = f"{self.input_path}/expanded.idf"
        self.epw_path = epw_path
        self.output_path = output_path
        self.energy_path = energy_path
        self.rooms = rooms
        self.pmv_upperbound = pmv_upperbound
        self.pmv_lowerbound = pmv_lowerbound
        self.vel_max = vel_max
        self.margem_adaptativo = margem_adaptativo
        self.temp_ac_min = temp_ac_min
        self.temp_ac_max = temp_ac_max
        self.met = met
        self.wme = wme

        if not os.path.exists(self.output_path):
            os.makedirs(self.output_path)

        self.ep_api = EnergyPlusAPI()
        self.state = self.ep_api.state_manager.new_state()

        self.save_parameters()

        self.conditioner = ConditioningPmv(ep_api=self.ep_api,
                                    rooms=self.rooms,
                                    pmv_upperbound=self.pmv_upperbound, 
                                    pmv_lowerbound=self.pmv_lowerbound, 
                                    vel_max=self.vel_max, 
                                    margem_adaptativo=self.margem_adaptativo, 
                                    temp_ac_min=self.temp_ac_min, 
                                    temp_ac_max=self.temp_ac_max, 
                                    met=self.met, 
                                    wme=self.wme
        )

    def save_parameters(self):
        with open(os.path.join(self.output_path, "parameters.txt"), "w") as writer:
            writer.write(f"pmv_upperbound={self.pmv_upperbound}\n")
            writer.write(f"pmv_lowerbound={self.pmv_lowerbound}\n")
            writer.write(f"vel_max={self.vel_max}\n")
            writer.write(f"margem_adaptativo={self.margem_adaptativo}\n")
            writer.write(f"temp_ac_min={self.temp_ac_min}\n")
            writer.write(f"temp_ac_max={self.temp_ac_max}\n")
            writer.write(f"met={self.met}\n")
            writer.write(f"wme={self.wme}\n")

    def run(self):
        # Expanding objects and creating expanded.idf
        if platform.system() == "Windows":
            os.system(f"cd \"{self.input_path}\" && {os.path.join(self.energy_path, EXPAND_OBJECTS_APP)}")
        else:
            os.system(f"cd \"{self.input_path}\" ; {os.path.join(self.energy_path, EXPAND_OBJECTS_APP)}")

        # Moving expanded.idf to output folder
        os.rename(f"{self.expanded_idf_path}", f"{os.path.join(self.output_path, 'expanded.idf')}")

        # Saving expanded.idf path
        self.expanded_idf_path = os.path.join(self.output_path, 'expanded.idf')

        # Running simulation
        self.ep_api.runtime.callback_begin_zone_timestep_after_init_heat_balance(self.state, self.conditioner)
        self.ep_api.runtime.run_energyplus(self.state,
            ['--weather', self.epw_path, '--output-directory', self.output_path, self.expanded_idf_path]
        )
        self.ep_api.state_manager.reset_state(self.state)

        # Parsing results to CSV
        if platform.system() == "Windows":
            os.system(f"cd \"{self.output_path}\" && {os.path.join(self.energy_path, TO_CSV_APP)} eplusout.eso")
        else:
            os.system(f"cd \"{self.output_path}\" ; {os.path.join(self.energy_path, TO_CSV_APP)} eplusout.eso")

        # Parsing results and spliting rooms into each file
        utils.process_esofile(self.rooms, self.output_path)