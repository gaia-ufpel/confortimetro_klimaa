import pythermalcomfort
from ladybug_comfort.pmv import predicted_mean_vote

class ConditioningPmv:
    def __init__(self, ep_api, rooms, pmv_upperbound=0.5, pmv_lowerbound=-0.5, vel_max=1.2, margem_adaptativo=2.5, temp_ac_min=14, temp_ac_max=32, reduce_consume=False, met=1.2, wme=0.0):
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

        # Custom configs
        self.air_conditioning = True
        self.ac_checker_counter = 6
        self.ac_checker_interval = 6
        self.fresh_start = True

    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
        if not self.ep_api.exchange.api_data_fully_ready(state):
            return
            
        for room in self.rooms:
            # Pegandos os handlers
            tdb_handler = self.ep_api.exchange.get_variable_handle(state, "Site Outdoor Air Drybulb Temperature", "Environment")
            temp_ar_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room)
            mrt_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room)
            hum_rel_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room)
            temp_op_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Operative Temperature", room)
            adaptativo_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature", f"PEOPLE_{room.upper()}")
            clo_handler = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"PEOPLE_{room.upper()}")
            #clo_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Compact", "Schedule Value", f"CLO")
            status_janela_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"JANELA_{room.upper()}")
            status_vent_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
            vel_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
            status_ac_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
            temp_cool_ac_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_COOL_AC_{room.upper()}")
            temp_heat_ac_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_HEAT_AC_{room.upper()}")
            pmv_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"PMV_{room.upper()}")
            temp_op_max_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_OP_MAX_ADAP_{room.upper()}")
            adaptativo_min = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MIN_{room.upper()}")
            adaptativo_max = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MAX_{room.upper()}")
            em_conforto_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"EM_CONFORTO_{room.upper()}")

            # Pegando todos os valores que são realmente necessários antes
            tdb = self.ep_api.exchange.get_variable_value(state, tdb_handler)
            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}")) # Contagem de pessoas na sala
            adaptativo = self.ep_api.exchange.get_variable_value(state, adaptativo_handler)
            temp_ar = self.ep_api.exchange.get_variable_value(state, temp_ar_handler)
            temp_op = self.ep_api.exchange.get_variable_value(state, temp_op_handler)
            mrt = self.ep_api.exchange.get_variable_value(state, mrt_handler)
            temp_op_max = self.ep_api.exchange.get_actuator_value(state, temp_op_max_handler)

            if people_count > 0.0:
                hum_rel = self.ep_api.exchange.get_variable_value(state, hum_rel_handler) # Umidade relativa
                clo = self.ep_api.exchange.get_variable_value(state, clo_handler) # Roupagem
                #clo = self.ep_api.exchange.get_actuator_value(state, clo_handler) # Roupagem

                # Valores iniciais
                status_janela = self.ep_api.exchange.get_actuator_value(state, status_janela_handler)
                status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_handler)
                temp_cool_ac = self.temp_ac_max
                temp_heat_ac = self.temp_ac_min
                vel = self.ep_api.exchange.get_actuator_value(state, vel_handler)

                if self.fresh_start:
                    status_janela = 1.0 if temp_op > tdb else 0.0
                    status_ac = 0.0
                    vel = 0.0

                #print(f'data: {self.ep_api.exchange.day_of_month(state)} - temp_ar: {temp_ar} - mrt: {mrt} - vel: {vel} - rh: {hum_rel} - met: {self.met} - clo: {clo} - pmv: {self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)}')

                temp_op_max = self.get_temp_max_op(vel)
                if status_janela == 1.0:
                    # Executar com o modelo adaptativo ou adaptativo com implemento
                    if vel == 0.0:
                        # Executar com o modelo adaptativo
                        if adaptativo - self.margem_adaptativo > temp_op or temp_ar < tdb:
                            status_janela = 0.0
                        elif adaptativo + self.margem_adaptativo < temp_op and temp_ar >= tdb:
                            status_janela = 1.0
                    if temp_op > adaptativo + self.margem_adaptativo:
                        if temp_op >= 25.0 and temp_op <= 27.2:
                            # Executar com o modelo adaptativo com incremento da velocidade
                            vel = self.get_vel_adap(temp_op)
                            vel = round(vel, 2)
                            if vel > self.vel_max:
                                vel = self.vel_max
                                if temp_ar < tdb:
                                    status_ac = 1
                                    status_janela = 0
                            temp_op_max = self.get_temp_max_op(vel)
                        else:
                            # Para transiçao entre o modelo adaptativo e o modelo pmv
                            vel = 0
                            status_janela = 0
                            temp_op_max = self.get_temp_max_op(vel)

                pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)
                if (pmv < self.pmv_lowerbound or pmv > self.pmv_upperbound) and status_janela == 0:
                    # Executar com o modelo PMV
                    vel, status_ac = self.get_best_velocity_with_pmv(temp_ar, mrt, vel, hum_rel, clo)
                    if status_ac == 1:
                        temp_cool_ac, temp_heat_ac = self.get_best_temperatures_with_pmv(mrt, vel, hum_rel, clo)

                pmv = self.get_pmv(temp_ar, mrt, vel, hum_rel, clo)

                # Mandando para o Energy os valores atualizados
                self.ep_api.exchange.set_actuator_value(state, status_vent_handler, 1 if vel > 0 else 0)
                self.ep_api.exchange.set_actuator_value(state, vel_handler, vel)
                self.ep_api.exchange.set_actuator_value(state, status_ac_handler, status_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_cool_ac_handler, temp_cool_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_heat_ac_handler, temp_heat_ac)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handler, status_janela)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_handler, temp_op_max)
                self.ep_api.exchange.set_actuator_value(state, pmv_handler, pmv)
                em_conforto = self.is_comfortable(temp_op, adaptativo, temp_op_max, pmv, status_janela, vel)
                self.ep_api.exchange.set_actuator_value(state, em_conforto_handler, em_conforto)
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_handler, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_handler, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_handler, 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_cool_ac_handler, self.temp_ac_max)
                self.ep_api.exchange.set_actuator_value(state, temp_heat_ac_handler, self.temp_ac_min)
                self.ep_api.exchange.set_actuator_value(state, pmv_handler, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handler, 1.0 if temp_ar > tdb else 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_handler, 0.0)
                self.ep_api.exchange.set_actuator_value(state, em_conforto_handler, 1)

            self.ep_api.exchange.set_actuator_value(state, adaptativo_max, adaptativo + self.margem_adaptativo)
            self.ep_api.exchange.set_actuator_value(state, adaptativo_min, adaptativo - self.margem_adaptativo)
            
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
    
    def is_comfortable(self, temp_op, adaptativo, temp_op_max, pmv, status_janela, vel):
        if adaptativo >= temp_op - self.margem_adaptativo and adaptativo <= temp_op + self.margem_adaptativo and status_janela == 1.0 and vel == 0.0:
            return 1
        if temp_op <= temp_op_max and vel > 0.0 and status_janela == 1.0:
            return 1
        if pmv <= self.pmv_upperbound and pmv >= self.pmv_lowerbound and status_janela == 0.0:
            return 1

        return 0