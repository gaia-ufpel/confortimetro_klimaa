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
OUTPUT_PATH = '/mnt/sda1/gabriellb/Documentos/Faculdade/projetos/klimaa/simulacoes/output_files/round11'

MET = 1.2
WME = 0.0
VEL_MIN = 0.0
VEL_MAX = 1.35
TEMP_AC_MIN = 14
TEMP_AC_MAX = 32
TEMP_AC_INI = 24
PMV_UPPERBOUND = 1.1
PMV_LOWERBOUND = -1 * PMV_UPPERBOUND
REDUCE_CONSUME = False

class CheckPmvConditions:
    def __init__(self, ep_api):
        self.ep_api = ep_api
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        for room in ["SALA_AULA", "ATELIE1", "ATELIE2", "ATELIE3", "SEC_LINSE", "LINSE", "RECEPCAO"]:
            # Ventilador ligado ou desligado
            status_vent_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
        
            # Velocidade do ventilador
            vel_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
                    
            # Status do ar condicionado
            status_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
                    
            # Temperatura do ar condicionado
            temp_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_AC_{room.upper()}")
            
            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"People_{room.lower()}"))
            #people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone People Occupant Count", f"{room.upper()}"))
            #people_count = self.ep_api.exchange.get_actuator_value(state, self.ep_api.exchange.get_actuator_handle(state, "People", "Number of People", f"People_{room.lower()}"))
            #people_count = self.ep_api.exchange.get_actuator_value(state, self.ep_api.exchange.get_actuator_handle(state, "Schedule:Compact", "Schedule Value", f"OCUPACAO Schedule"))

            #print(people_count)

            #hour = self.ep_api.exchange.current_time(state)
            #is_holiday = self.ep_api.exchange.holiday_index(state) == 1
            #day_week = self.ep_api.exchange.day_of_week(state)

            # Verifica se existe ocupacao
            #if ((hour >= 8.0 and hour <= 12.0) or (hour >= 13.5 and hour <= 19.0)) and (not is_holiday) and (day_week > 1) and (day_week < 7):
            if people_count > 0.0:   
                # PMV da zona
                pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"People_{room.lower()}")
                pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)
                
                if pmv < PMV_LOWERBOUND or pmv > PMV_UPPERBOUND:
                    status_vent = self.ep_api.exchange.get_actuator_value(state, status_vent_actuator)
                    vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)
                    status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
                    temp_ac = self.ep_api.exchange.get_actuator_value(state, temp_ac_actuator)
                    
                    # Temperatura do ar
                    temp_interna = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room))
                    #print(f"temp_int = {temp_interna}")
                    # Temperatura media radiante
                    mrt = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room))
                    #print(f"mrt = {mrt}")
                    # Humidade relativa
                    hum_rel = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room))
                    #print(f"hum_rel = {hum_rel}")
                    # Roupagem
                    clo = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"People_{room.lower()}"))
                    #print(f"clo = {clo}")
                
                    pmv_pythermal = pythermalcomfort.models.pmv(
                        temp_interna,
                        mrt,
                        vel,
                        hum_rel,
                        MET,
                        clo,
                        WME,
                        stardard='ashrae',
                        limit_inputs=False
                    )
                    
                    # Minimizar o gasto energético ----------
                    while pmv_pythermal <= PMV_UPPERBOUND and pmv_pythermal >= PMV_LOWERBOUND and REDUCE_CONSUME:
                        if status_ac == 1:
                            if temp_ac > TEMP_AC_INI:
                                temp_ac -= 1
                            elif temp_ac < TEMP_AC_INI:
                                temp_ac += 1
                            else:
                                status_ac = 0
                        elif vel > 0.0:
                            vel = (vel * 10 - 1) / 10
                            
                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            MET,
                            clo,
                            WME,
                            stardard='ashrae',
                            limit_inputs=False
                        )

                    # -----------------------------------------
                    # Corrigindo o PMV ------------------------
                    while pmv_pythermal > PMV_UPPERBOUND:
                        if vel < VEL_MAX:
                            vel = (vel * 10 + 1) / 10
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif temp_ac > TEMP_AC_MIN and temp_ac < TEMP_AC_INI:
                            temp_ac -= 1
                        elif temp_ac > TEMP_AC_INI:
                            status_ac = 0.0
                            temp_ac = TEMP_AC_INI
                            break
                        else:
                            break

                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            MET,
                            clo,
                            WME,
                            stardard='ashrae',
                            limit_inputs=False
                        )

                    while pmv_pythermal < PMV_LOWERBOUND:
                        if vel > VEL_MIN:
                            # Modificando velocidade do ventilador
                            vel = (vel * 10 - 1) / 10
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif temp_ac > TEMP_AC_INI and temp_ac < TEMP_AC_MAX:
                            temp_ac += 1
                        elif temp_ac < TEMP_AC_INI:
                            status_ac = 0.0
                            temp_ac = TEMP_AC_INI
                            break
                        else:
                            break

                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            MET,
                            clo,
                            WME,
                            stardard='ashrae',
                            limit_inputs=False
                        )

                    # -----------------------------------------
                    # Corrigindo o PMV ------------------------
                    while pmv_pythermal > PMV_UPPERBOUND:
                        break     
                        if temp_ac > TEMP_AC_MIN and temp_ac < TEMP_AC_MAX and status_ac == 1:
                            # Modificando temperatura do ar condicionado
                            temp_ac -= 1
                        elif temp_ac == TEMP_AC_INI and status_ac == 1:
                            status_ac = 0
                            status_vent = 1
                        elif vel < VEL_MAX and status_vent == 1:
                            # Modificando velocidade do ventilador
                            vel = (vel * 10 + 1) / 10
                            status_vent = 1
                        elif vel == VEL_MAX and status_ac == 0:
                            status_ac = 1
                            status_vent = 0
                        else:
                            # Quando nao tiver mais nada a ser feito e o pmv continuar ruim
                            break
                            
                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            MET,
                            clo,
                            WME,
                            stardard='ashrae',
                            limit_inputs=False
                        )
                            
                    while pmv_pythermal < PMV_LOWERBOUND:
                        break
                        if temp_ac > TEMP_AC_MIN and temp_ac < TEMP_AC_MAX and status_ac == 1:
                            # Modificando temperatura do ar condicionado
                            temp_ac += 1
                        elif temp_ac == TEMP_AC_INI and status_ac == 1:
                            status_ac = 0
                            status_vent = 1
                        elif vel > VEL_MIN and status_vent == 1:
                            # Modificando velocidade do ventilador
                            vel = (vel * 10 - 1) / 10
                            status_vent = 1
                        elif vel == VEL_MIN and status_ac == 0:
                            status_ac = 1
                            status_vent = 0
                        else:
                            # Quando nao tiver mais nada a ser feito e o pmv continuar ruim
                            break
                            
                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            MET,
                            clo,
                            WME,
                            stardard='ashrae',
                            limit_inputs=False
                        )
                    
                    if vel > 0.0:
                        status_vent = 1.0

                    # Mandando para o Energy os valores atualizados                           
                    self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 1.0 if vel > 0.0 else 0.0)
                    self.ep_api.exchange.set_actuator_value(state, vel_actuator, vel)
                    self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, status_ac)
                    self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, temp_ac)
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, 24)
         
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
