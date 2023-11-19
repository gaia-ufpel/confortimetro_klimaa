import sys
import os
import glob
import pythermalcomfort

ENERGY_PATH = "/usr/local/EnergyPlus-9-4-0"
sys.path.append(ENERGY_PATH)
print(sys.path)

from pyenergyplus.api import EnergyPlusAPI
EnergyPlusAPI.api_version()

INPUT_PATH = '/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/input_files'
IDF_PATH = '/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/input_files/expanded.idf'
EPW_PATH = '/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/input_files/BRA_RS_Pelotas-2003-2017.epw'
OUTPUT_PATH = '/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/output_files/round9'

class CheckPmvConditions:
    def __init__(self, ep_api):
        self.ep_api = ep_api
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        for room in ["SALA_AULA", "ATELIE1", "ATELIE2", "ATELIE3", "SEC_LINSE", "LINSE", "RECEPCAO"]:
            # Ocupação da zona
            #ocupacao_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Compact", "Schedule Value", f"OCUPACAO Schedule")
            #ocupacao = self.ep_api.exchange.get_actuator_value(state, ocupacao_handle)
            #ocupacao_handle = self.ep_api.exchange.get_variable_handle(state, "Number of People", f"People_{room.lower()}")
            #ocupacao = self.ep_api.exchange.get_variable_value(state, ocupacao_handle)


            # PMV da zona
            pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"People_{room.lower()}")
            pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)

            # Ventilador ligado ou desligado
            status_vent_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
            status_vent = self.ep_api.exchange.get_actuator_value(state, status_vent_actuator)
            
            # Velocidade do ventilador
            vel_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
            vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)
            
            # Status do ar condicionado
            status_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
            status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
            
            # Temperatura do ar condicionado
            temp_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_AC_{room.upper()}")
            temp_ac = self.ep_api.exchange.get_actuator_value(state, temp_ac_actuator)

            #print(ocupacao)
            hour = self.ep_api.exchange.current_time(state)
            
            #print(hour)

            # Verifica se existe ocupacao
            #if ocupacao != 0:
            if (hour >= 8.0 and hour < 12.0) or (hour >= 13.5 and hour < 19.0):
                # Atualizando a velocidade do ventilador conforme o PMV
                if pmv > 1.1:
                    if vel < 1.5 and status_ac == 0:
                        # Modificando velocidade do ventilador
                        self.ep_api.exchange.set_actuator_value(state, vel_actuator, (vel*10 + 1)/10)
                        self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 1.0)
                    elif status_ac == 1 and temp_ac == 24:
                        self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0)
                    elif temp_ac <= 14 and temp_ac >= 32:
                        self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 1)
                        # Modificando temperatura do ar condicionado
                        self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, temp_ac - 1)
                elif pmv < -1.1:
                    if vel > 0.0 and status_ac == 0:
                        # Modificando velocidade do ventilador
                        self.ep_api.exchange.set_actuator_value(state, vel_actuator, (vel*10 - 1)/10)
                        if vel == 0.1:
                            self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                    elif status_ac == 1 and temp_ac == 24:
                        self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0)
                    elif temp_ac <= 14 and temp_ac >= 32:
                        self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 1)
                        # Modificando temperatura do ar condicionado
                        self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, temp_ac + 1)
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, 24)

            # Ligando ou desligando o equipamento elétrico ventilador
            #if vel != 0.0:
            #    self.ep_api.exchange.set_actuator_value(state, status_vent_handle, 1.0)
            #else:
            #    self.ep_api.exchange.set_actuator_value(state, status_vent_handle, 0.0)
         
if __name__ == "__main__":
    os.system(f"/usr/local/EnergyPlus-9-4-0/ExpandObjects {os.path.join(INPUT_PATH, 'in.idf')}")

    ep_api = EnergyPlusAPI()
    state = ep_api.state_manager.new_state()

    checker = CheckPmvConditions(ep_api)
    #ep_api.runtime.callback_begin_system_timestep_before_predictor(state, checker)
    ep_api.runtime.callback_begin_zone_timestep_before_init_heat_balance(state, checker)
    ep_api.runtime.run_energyplus(state, ['--weather', EPW_PATH, '--output-directory', OUTPUT_PATH, IDF_PATH])
    ep_api.state_manager.reset_state(state)
    
    os.system(f"cd {OUTPUT_PATH} ; /usr/local/EnergyPlus-9-4-0/runreadvars {os.path.join(OUTPUT_PATH, 'eplusout.eso')}")
