import sys
import os
import platform
from importlib import import_module

from eppy.modeleditor import IDF

from simulation_config import SimulationConfig
from conditioner_all import ConditionerAll
from conditioner_ac import ConditionerAc
from conditioner_without_window import ConditionerWithoutWindow
import utils

EnergyPlusAPI = None

MET_SCHEDULE_NAME = "METABOLISMO"
WME_SCHEDULE_NAME = "WORK_EF"

EXPAND_OBJECTS_APP = "ExpandObjects"
TO_CSV_APP = "runreadvars"

if platform.system() == "Windows":
    EXPAND_OBJECTS_APP = "ExpandObjects.exe"
    TO_CSV_APP = "RunReadESO.bat"

class Simulation:
    def __init__(self, configs: SimulationConfig):
        self.configs = configs

        sys.path.append(self.configs.energy_path)
        EnergyPlusAPI = import_module("pyenergyplus.api").EnergyPlusAPI

        self.ep_api = EnergyPlusAPI()
        self.state = self.ep_api.state_manager.new_state()

        self.conditioner = ConditionerAc(ep_api=self.ep_api, configs=SimulationConfig(**self.configs.__dict__))

    def run(self):
        # Modifying IDF file
        IDF.setiddname(os.path.join(self.configs.energy_path, "Energy+.idd"))
        idf = IDF(self.configs.idf_path)
        for schedule in idf.idfobjects["Schedule:Constant"]:
            if schedule.Name == MET_SCHEDULE_NAME:
                schedule.Schedule_Type_Limits_Name = "Any Number"
                schedule.Hourly_Value = self.configs.met_as_watts
            elif schedule.Name == WME_SCHEDULE_NAME:
                schedule.Schedule_Type_Limits_Name = "Any Number"
                schedule.Hourly_Value = self.configs.wme
        idf.save(self.configs.idf_path)

        # Expanding objects and creating expanded.idf
        if platform.system() == "Windows":
            os.system(f'cd \"{self.configs.input_path}\" && cp \"{self.configs.idf_filename}\" in.idf && \"{os.path.join(self.configs.energy_path, EXPAND_OBJECTS_APP)}\"')
        else:
            os.system(f'cd \"{self.configs.input_path}\" ; cp \"{self.configs.idf_filename}\" in.idf ; \"{os.path.join(self.configs.energy_path, EXPAND_OBJECTS_APP)}\"')

        # Moving expanded.idf to output folder
        os.rename(os.path.join(self.configs.input_path, "expanded.idf"), self.configs.expanded_idf_path)
        os.makedirs(self.configs.output_path, exist_ok=True)
        self.configs.to_json(os.path.join(self.configs.output_path, "configs.json"))

        # Running simulation
        self.ep_api.runtime.callback_begin_zone_timestep_after_init_heat_balance(self.state, self.conditioner)
        self.ep_api.runtime.run_energyplus(self.state,
            ['--weather', self.configs.epw_path, '--output-directory', self.configs.output_path, self.configs.expanded_idf_path]
        )
        self.ep_api.state_manager.reset_state(self.state)

        # Parsing results to CSV
        if platform.system() == "Windows":
            os.system(f"cd \"{self.configs.output_path}\" && {os.path.join(self.configs.energy_path, TO_CSV_APP)} eplusout.eso")
        else:
            os.system(f"cd \"{self.configs.output_path}\" ; {os.path.join(self.configs.energy_path, TO_CSV_APP)} eplusout.eso")

        for room in self.configs.rooms:
            utils.summary_results_from_room(os.path.join(self.configs.output_path, 'eplusout.csv'), room)

        utils.get_stats_from_simulation(self.configs.output_path, self.configs.rooms)