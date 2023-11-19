import sys
import os
import glob
import pythermalcomfort

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

MET = 1.2
WME = 0.0
VEL_MIN = 0.0
VEL_MAX = 1.35
TEMP_AC_MIN = 14
TEMP_AC_MAX = 32
TEMP_AC_INI = 0.0
PMV_UPPERBOUND = 1.1
PMV_LOWERBOUND = -1 * PMV_UPPERBOUND
REDUCE_CONSUME = False

class ConditioningPmv:
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
            
            if people_count > 0.0:   
                # PMV da zona
                pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"People_{room.lower()}")
                pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)
                
                if pmv < PMV_LOWERBOUND or pmv > PMV_UPPERBOUND:
                    if pmv < PMV_LOWERBOUND:
                        TEMP_AC_INI = TEMP_AC_MIN
                    else:
                        TEMP_AC_INI = TEMP_AC_MAX
                    
                    temp_ac = TEMP_AC_INI

                    status_vent = self.ep_api.exchange.get_actuator_value(state, status_vent_actuator)
                    vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)
                    status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
                    temp_ac = self.ep_api.exchange.get_actuator_value(state, temp_ac_actuator)
                    
                    # Temperatura do ar
                    temp_interna = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room))
                    # Temperatura media radiante
                    mrt = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room))
                    # Humidade relativa
                    hum_rel = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room))
                    # Roupagem
                    clo = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"People_{room.lower()}"))
                
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
                            vel = (vel * 100 + 5) / 100
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif temp_ac > TEMP_AC_MIN and temp_ac <= TEMP_AC_INI:
                            temp_ac -= 1.0
                        elif temp_ac > TEMP_AC_INI:
                            status_ac = 0.0
                            temp_ac = TEMP_AC_INI
                            break
                        else:
                            break

                        if status_ac == 1:
                            pmv_pythermal = pythermalcomfort.models.pmv(
                                temp_ac,
                                mrt,
                                vel,
                                hum_rel,
                                MET,
                                clo,
                                WME,
                                stardard='ashrae',
                                limit_inputs=False
                            )
                        else:
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
                            

                    while pmv_pythermal < PMV_LOWERBOUND:
                        if vel > VEL_MIN:
                            # Modificando velocidade do ventilador
                            vel = (vel * 100 - 5) / 100
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif temp_ac >= TEMP_AC_INI and temp_ac < TEMP_AC_MAX:
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
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, 24.0)
         
if __name__ == "__main__":
    os.system(f"cd {INPUT_PATH} ; {os.path.join(ENERGY_PATH, 'ExpandObjects')} {IDF_PATH}")

    ep_api = EnergyPlusAPI()
    state = ep_api.state_manager.new_state()

    conditioner = ConditioningPmv(ep_api)

    ep_api.runtime.callback_begin_zone_timestep_before_init_heat_balance(state, conditioner)
    ep_api.runtime.run_energyplus(state, ['--weather', EPW_PATH, '--output-directory', OUTPUT_PATH, EXPANDED_IDF_PATH])
    ep_api.state_manager.reset_state(state)
    
    os.system(f"cd {OUTPUT_PATH} ; {os.path.join(ENERGY_PATH, 'runreadvars')} {os.path.join(OUTPUT_PATH, 'eplusout.eso')}")
