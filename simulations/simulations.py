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
OUTPUT_PATH = './assets/outputs/'
ROOMS = ["SALA_AULA", "ATELIE1", "ATELIE2", "ATELIE3", "SEC_LINSE", "LINSE", "RECEPCAO"]

def run_simulation(input_path=INPUT_PATH, idf_path=IDF_PATH, expanded_idf_path=EXPANDED_IDF_PATH, epw_path=EPW_PATH, output_path=OUTPUT_PATH, energy_path=ENERGY_PATH, rooms=ROOMS):
    # Expanding objects and creating expanded.idf
    os.system(f"cd {input_path} ; {os.path.join(energy_path, 'ExpandObjects')} {idf_path}")

    ep_api = EnergyPlusAPI()
    state = ep_api.state_manager.new_state()

    conditioner = ConditioningPmv(ep_api, rooms, 1.1, -1.1)

    # Running simulation
    ep_api.runtime.callback_begin_zone_timestep_before_init_heat_balance(state, conditioner)
    ep_api.runtime.run_energyplus(state, ['--weather', epw_path, '--output-directory', output_path, expanded_idf_path])
    ep_api.state_manager.reset_state(state)
    
    # Removing expanded.idf
    os.system(f"rm {expanded_idf_path}")

    # Reading output variables
    os.system(f"cd {output_path} ; {os.path.join(energy_path, 'runreadvars')} {'eplusout.eso'}")

if __name__ == "__main__":
    run_simulation(rooms=["SALA"])    