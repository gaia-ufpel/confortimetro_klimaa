import pythermalcomfort
from ladybug_comfort.pmv import predicted_mean_vote
import logging
import datetime

class ConditioningPmv:
    def __init__(self, ep_api, rooms, pmv_upperbound=0.5, pmv_lowerbound=-0.5, vel_max=1.2, margem_adaptativo=2.5, temp_ac_min=14, temp_ac_max=32, reduce_consume=False, met=1.2, wme=0.0):
        logging.basicConfig(filename=f'logs/simulation_{datetime.datetime.now().isoformat()}.log', format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

        self.ep_api = ep_api
        self.rooms = rooms
        self.pmv_upperbound = pmv_upperbound
        self.pmv_lowerbound = pmv_lowerbound
        self.vel_max = vel_max
        self.margem_adaptativo = margem_adaptativo
        self.temp_ac_min = temp_ac_min
        self.temp_ac_max = temp_ac_max
        self.reduce_consume = reduce_consume
        self.met = met
        self.wme = wme
        self.handlers_acquired = False

        self.people_count_handler = {}
        self.tdb_handler = None
        self.temp_ar_handler = {}
        self.mrt_handler = {}
        self.hum_rel_handler = {}
        self.temp_op_handler = {}
        self.adaptativo_handler = {}
        self.co2_handler = {}
        self.clo_handler = {}
        self.status_janela_handler = {}
        self.status_vent_handler = {}
        self.vel_handler = {}
        self.status_ac_handler = {}
        self.temp_cool_ac_handler = {}
        self.temp_heat_ac_handler = {}
        self.pmv_handler = {}
        self.temp_op_max_handler = {}
        self.adaptativo_min_handler = {}
        self.adaptativo_max_handler = {}
        self.em_conforto_handler = {}
        self.limite_co2_handler = {}
        self.status_doas_handler = {}

        self.ac_on_counter = 0
        self.ac_on_max_timesteps = 12

    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
        if not self.ep_api.exchange.api_data_fully_ready(state):
            return
        
        # Pegando todos os handlers
        if not self.handlers_acquired:
            self.acquire_handlers(state)
            self.handlers_acquired = True
            
        for room in self.rooms:
            # Pegando todos os valores que são realmente necessários antes
            people_count = self.ep_api.exchange.get_variable_value(state, self.people_count_handler[room]) # Contagem de pessoas na sala
            temp_neutra_adaptativo = self.ep_api.exchange.get_variable_value(state, self.adaptativo_handler[room])
            temp_max_adaptativo = temp_neutra_adaptativo + self.margem_adaptativo
            temp_min_adaptativo = temp_neutra_adaptativo - self.margem_adaptativo
            co2 = self.ep_api.exchange.get_variable_value(state, self.co2_handler[room])
            limite_co2 = self.ep_api.exchange.get_actuator_value(state, self.limite_co2_handler[room])
            temp_op = self.ep_api.exchange.get_variable_value(state, self.temp_op_handler[room])
            temp_ar = self.ep_api.exchange.get_variable_value(state, self.temp_ar_handler[room])
            tdb = self.ep_api.exchange.get_variable_value(state, self.tdb_handler)

            if people_count > 0.0:
                mrt = self.ep_api.exchange.get_variable_value(state, self.mrt_handler[room])
                hum_rel = self.ep_api.exchange.get_variable_value(state, self.hum_rel_handler[room]) # Umidade relativa
                clo = self.ep_api.exchange.get_variable_value(state, self.clo_handler[room]) # Roupagem
                #clo = self.ep_api.exchange.get_actuator_value(state, self.clo_handler[room]) # Roupagem
                temp_op_max = self.ep_api.exchange.get_actuator_value(state, self.temp_op_max_handler[room])

                # Valores iniciais
                status_janela = self.ep_api.exchange.get_actuator_value(state, self.status_janela_handler[room])
                vel = self.ep_api.exchange.get_actuator_value(state, self.vel_handler[room])
                status_ac = self.ep_api.exchange.get_actuator_value(state, self.status_ac_handler[room])
                status_doas = 0
                temp_cool_ac = self.ep_api.exchange.get_actuator_value(state, self.temp_cool_ac_handler[room])
                temp_heat_ac = self.ep_api.exchange.get_actuator_value(state, self.temp_heat_ac_handler[room])

                if self.ac_on_counter >= self.ac_on_max_timesteps:
                    status_janela = 1
                    vel = 0.0
                    status_ac = 0
                    self.ac_on_counter = 0

                #print(f'data: {self.ep_api.exchange.day_of_month(state)} - temp_ar: {temp_ar} - mrt: {mrt} - vel: {vel} - rh: {hum_rel} - met: {self.met} - clo: {clo} - pmv: {self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)}')

                temp_op_max = self.get_temp_max_op(vel)
                if status_janela == 1:
                    # Executar com o modelo adaptativo ou adaptativo com implemento
                    if vel == 0.0:
                        # Executar com o modelo adaptativo
                        if temp_op < temp_min_adaptativo or tdb > temp_ar:
                            status_janela = 0
                            status_ac = 1
                        #elif temp_op > adaptativo + self.margem_adaptativo and tdb <= temp_ar:
                        else:
                            status_janela = 1
                    if temp_op > temp_max_adaptativo:
                        if temp_op >= 25.0 and temp_op <= 27.2:
                            # Executar com o modelo adaptativo com incremento da velocidade
                            vel = self.get_vel_adap(temp_op)
                            vel = round(vel, 2)
                            if vel > self.vel_max:
                                vel = self.vel_max
                                status_ac = 0
                            temp_op_max = self.get_temp_max_op(vel)
                        else:
                            # Para transiçao entre o modelo adaptativo e o modelo pmv
                            vel = 0
                            status_janela = 0
                            status_ac = 1
                            temp_op_max = self.get_temp_max_op(vel)

                if status_janela == 0:
                    if status_ac == 1:
                        vel, _ = self.get_best_velocity_with_pmv(temp_ar, mrt, vel, hum_rel, clo)
                    else:
                        vel, status_ac = self.get_best_velocity_with_pmv(temp_ar, mrt, vel, hum_rel, clo)

                if status_ac == 1:
                    # Executar com o modelo PMV
                    temp_cool_ac, temp_heat_ac = self.get_best_temperatures_with_pmv(mrt, vel, hum_rel, clo)
                    self.ac_on_counter += 1
                    
                if co2 >= limite_co2 and status_janela == 0:
                    status_doas = 1
                else:
                    status_doas = 0

                pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)

                # Mandando para o Energy os valores atualizados
                self.ep_api.exchange.set_actuator_value(state, self.status_vent_handler[room], 1 if vel > 0 else 0)
                self.ep_api.exchange.set_actuator_value(state, self.vel_handler[room], vel)
                self.ep_api.exchange.set_actuator_value(state, self.status_ac_handler[room], status_ac)
                if self.status_doas_handler != -1:
                    self.ep_api.exchange.set_actuator_value(state, self.status_doas_handler[room], status_doas)
                self.ep_api.exchange.set_actuator_value(state, self.temp_cool_ac_handler[room], temp_cool_ac)
                self.ep_api.exchange.set_actuator_value(state, self.temp_heat_ac_handler[room], temp_heat_ac)
                self.ep_api.exchange.set_actuator_value(state, self.status_janela_handler[room], status_janela)
                self.ep_api.exchange.set_actuator_value(state, self.temp_op_max_handler[room], temp_op_max)
                self.ep_api.exchange.set_actuator_value(state, self.pmv_handler[room], pmv)
                em_conforto = self.is_comfortable(temp_op, temp_neutra_adaptativo, temp_op_max, pmv, status_janela, vel)
                self.ep_api.exchange.set_actuator_value(state, self.em_conforto_handler[room], em_conforto)
            else:
                # Eliminando CO2 da sala
                status_janela = 0
                if co2 >= limite_co2 and temp_op > temp_max_adaptativo and tdb < temp_ar:
                    status_janela = 1

                self.ac_on_counter = 0

                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, self.status_vent_handler[room], 0)
                self.ep_api.exchange.set_actuator_value(state, self.vel_handler[room], 0)
                self.ep_api.exchange.set_actuator_value(state, self.status_ac_handler[room], 0)
                if self.status_doas_handler != -1:
                    self.ep_api.exchange.set_actuator_value(state, self.status_doas_handler[room], 0)
                self.ep_api.exchange.set_actuator_value(state, self.temp_cool_ac_handler[room], self.temp_ac_max)
                self.ep_api.exchange.set_actuator_value(state, self.temp_heat_ac_handler[room], self.temp_ac_min)
                self.ep_api.exchange.set_actuator_value(state, self.pmv_handler[room], 0)
                self.ep_api.exchange.set_actuator_value(state, self.status_janela_handler[room], status_janela)
                self.ep_api.exchange.set_actuator_value(state, self.temp_op_max_handler[room], 0)
                self.ep_api.exchange.set_actuator_value(state, self.em_conforto_handler[room], 1)

            self.ep_api.exchange.set_actuator_value(state, self.adaptativo_max_handler[room], temp_max_adaptativo)
            self.ep_api.exchange.set_actuator_value(state, self.adaptativo_min_handler[room], temp_min_adaptativo)
            
    def get_best_velocity_with_pmv(self, temp_ar, mrt, vel, hum_rel, clo):
        status_ac = 0
        pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)
        while pmv > self.pmv_upperbound:
            vel = round(vel + 0.05, 2)
            if vel >= self.vel_max:
                vel = self.vel_max
                status_ac = 1
                break
            pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)

        while pmv < self.pmv_lowerbound:
            vel = round(vel - 0.05, 2)
            if vel <= 0.0:
                vel = 0.0
                status_ac = 1
                break
            pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)

        return vel, status_ac

    def get_best_temperatures_with_pmv(self, mrt, vel, hum_rel, clo):
        best_cool_temp = self.temp_ac_max
        best_heat_temp = self.temp_ac_min
        
        pmv = self.get_pmv(best_cool_temp, mrt, vel, hum_rel, clo)
        while pmv > self.pmv_upperbound:
            best_cool_temp -= 1.0
            if best_cool_temp <= self.temp_ac_min:
                best_cool_temp = self.temp_ac_min
                break
            pmv = self.get_pmv(best_cool_temp, mrt, vel, hum_rel, clo)

        pmv = self.get_pmv(best_heat_temp, mrt, vel, hum_rel, clo)
        while pmv < self.pmv_lowerbound:
            best_heat_temp += 1.0
            if best_heat_temp >= self.temp_ac_max:
                best_heat_temp = self.temp_ac_max
                break
            pmv = self.get_pmv(best_heat_temp, mrt, vel, hum_rel, clo)

        return best_cool_temp, best_heat_temp

    def get_pmv(self, temp_ar, mrt, vel, rh, clo):
        return predicted_mean_vote(
            ta=temp_ar,
            tr=mrt,
            vel=pythermalcomfort.utilities.v_relative(vel, met=self.met),
            rh=rh,
            met=self.met,
            clo=pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
            wme=self.wme
        )['pmv']

    def get_temp_max_op(self, vel):
        return -0.3535 * vel ** 2 + 2.2758 * vel + 24.995
    
    def get_vel_adap(self, temp_op):
        return 0.055 * temp_op ** 2 - 2.331 * temp_op + 23.935 + 0.1
    
    def is_comfortable(self, temp_op:float, adaptativo:float, temp_op_max:float, pmv:float, status_janela:int, vel:float):
        if adaptativo >= temp_op - self.margem_adaptativo and adaptativo <= temp_op + self.margem_adaptativo and status_janela == 1 and vel == 0.0:
            logging.info(temp_op - self.margem_adaptativo)
            logging.info(temp_op + self.margem_adaptativo)
            logging.info(adaptativo)
            return 1
        if temp_op <= temp_op_max and vel > 0.0 and status_janela == 1:
            return 1
        if pmv <= self.pmv_upperbound and pmv >= self.pmv_lowerbound and status_janela == 0:
            return 1

        return 0
    
    def acquire_handlers(self, state):
        self.tdb_handler = self.ep_api.exchange.get_variable_handle(state, "Site Outdoor Air Drybulb Temperature", "Environment")
        for room in self.rooms:
            handler = self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador People Occupant Count da sala {room}")
            self.people_count_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room)
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Air Temperature da sala {room}")
            self.temp_ar_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room)
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Mean Radiant Temperature da sala {room}")
            self.mrt_handler.update({ room : handler })

            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room)
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Air Relative Humidity da sala {room}")
            self.hum_rel_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Operative Temperature", room)
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Operative Temperature da sala {room}")
            self.temp_op_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature", f"PEOPLE_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature da sala {room}")
            self.adaptativo_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Air CO2 Concentration", f"{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Air CO2 Concentration da sala {room}")
            self.co2_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"PEOPLE_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador Zone Thermal Comfort Clothing Value da sala {room}")
            self.clo_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"JANELA_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador JANELA da sala {room}")
            self.status_janela_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador VENT da sala {room}")
            self.status_vent_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador VEL da sala {room}")
            self.vel_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador AC da sala {room}")
            self.status_ac_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_COOL_AC_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador TEMP_COOL_AC da sala {room}")
            self.temp_cool_ac_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_HEAT_AC_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador TEMP_HEAT_AC da sala {room}")
            self.temp_heat_ac_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"PMV_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador PMV da sala {room}")
            self.pmv_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_OP_MAX_ADAP_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador TEMP_OP_MAX_ADAP da sala {room}")
            self.temp_op_max_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MIN_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador ADAP_MIN da sala {room}")
            self.adaptativo_min_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MAX_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador ADAP_MAX da sala {room}")
            self.adaptativo_max_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"EM_CONFORTO_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador ADAP_MAX da sala {room}")
            self.em_conforto_handler.update({ room : handler })
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"CO2_LIMITE")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador CO2_LIMITE da sala {room}")
            self.limite_co2_handler.update({ room : handler})
            
            handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"DOAS_STATUS_{room.upper()}")
            if handler <= 0:
                logging.error(f"Não foi possível pegar o tratador DOAS_STATUS da sala {room}")
            self.status_doas_handler.update({ room : handler})
