import sys
import os
import glob
from conditioning_pmv import ConditioningPmv

ENERGY_PATH = "/usr/local/EnergyPlus-9-4-0"
sys.path.append(ENERGY_PATH)
#print(sys.path)

from pyenergyplus.api import EnergyPlusAPI
#EnergyPlusAPI.api_version()

INPUT_PATH = './assets/inputs'
IDF_PATH = os.path.join(INPUT_PATH, 'in.idf')
EXPANDED_IDF_PATH = os.path.join(INPUT_PATH, 'expanded.idf')
EPW_PATH = os.path.join(INPUT_PATH, "BRA_RS_Pelotas-2003-2017.epw")
OUTPUT_PATH = './assets/outputs/4'
ROOMS = ["SALA_AULA", "ATELIE1", "ATELIE2", "ATELIE3", "SEC_LINSE", "LINSE", "RECEPCAO"]

class Simulation:
    def __init__(self, input_path=INPUT_PATH, idf_path=IDF_PATH, expanded_idf_path=EXPANDED_IDF_PATH, epw_path=EPW_PATH, output_path=OUTPUT_PATH, energy_path=ENERGY_PATH, rooms=ROOMS, pmv_upperbound=0.5, pmv_lowerbound=0.0, vel_max=1.35, margem_adaptativo=2.5, temp_ac_min=14.0, temp_ac_max=32.0, met=1.2, wme=0.0):
        self.input_path = input_path
        self.idf_path = idf_path
        self.expanded_idf_path = expanded_idf_path
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
        os.system(f"cd {self.input_path} ; {os.path.join(self.energy_path, 'ExpandObjects')} {self.idf_path}")

        # Running simulation
        self.ep_api.runtime.callback_begin_zone_timestep_before_init_heat_balance(self.state, self.conditioner)
        self.ep_api.runtime.run_energyplus(self.state,
                                    ['--weather', self.epw_path, '--output-directory', self.output_path, self.expanded_idf_path]
        )
        self.ep_api.state_manager.reset_state(self.state)

        # Reading output variables
        os.system(f"cd {self.output_path} ; {os.path.join(self.energy_path, 'runreadvars')} {'eplusout.eso'}")

if __name__ == "__main__":
    #run_simulation(rooms=["SALA"])
    pass