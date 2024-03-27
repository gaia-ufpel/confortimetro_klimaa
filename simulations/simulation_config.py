from dataclasses import dataclass
import json
import os

@dataclass
class SimulationConfig:
    epw_path: str
    output_path: str
    energy_path: str
    rooms: list[str]
    pmv_upperbound: float
    pmv_lowerbound: float
    co2_limit: float
    max_vel: float
    adaptative_bound: float
    temp_ac_min: float
    temp_ac_max: float
    met_as_watts: float
    wme: float

    _idf_path: str
    _met: float

    input_path: str = None
    expanded_idf_path: str = None
    idf_filename: str = None
    temp_open_window_bound: float = 5.0
    air_speed_delta: float = 0.15
    pmv_comfort_bound: float = 0.2

    def __post_init__(self):
        self.input_path = os.path.dirname(self.idf_path)
        self.expanded_idf_path = os.path.join(self.input_path, "expanded.idf")
        self.idf_filename = os.path.basename(self.idf_path)
        self.met_as_watts = self.met * 58.1 * 1.8

    @property
    def idf_path(self):
        return self._idf_path

    @idf_path.setter
    def idf_path(self, idf_path: str):
        self._idf_path = idf_path
        self.input_path = os.path.dirname(self.idf_path)
        self.expanded_idf_path = os.path.join(self.input_path, "expanded.idf")
        self.idf_filename = os.path.basename(self.idf_path)

    @property
    def met(self):
        return self._met
    
    @met.setter
    def met(self, met: float):
        self._met = met
        self.met_as_watts = met * 58.1 * 1.8

    def to_json(self, json_path: str=None):
        if json_path is None:
            json_path = os.path.join(self.output_path, "config.json")

        with open(json_path, "w") as writer:
            json.dump(self.__dict__, writer, indent=4)
    
    @staticmethod
    def from_json(json_path: str):
        with open(json_path, "r") as reader:
            data = json.load(reader)
        
        return SimulationConfig(**data)
