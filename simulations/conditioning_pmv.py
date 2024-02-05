import pythermalcomfort
import ladybug_comfort

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


        print(f"PMV bound: {pmv_lowerbound}, {pmv_upperbound}")
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        tdb_handle = self.ep_api.exchange.get_variable_handle(state, "Site Outdoor Air Drybulb Temperature", "Environment")
        tdb = self.ep_api.exchange.get_variable_value(state, tdb_handle)
        clo_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Compact", "Schedule Value", f"CLO")

        for room in self.rooms:
            # Valores de condições climáticas
            temp_ar_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room)
            mrt_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room)
            hum_rel_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room)
            temp_op_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Operative Temperature", room)

            # Controle dos dispositivos
            status_janela_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"JANELA_{room.upper()}")
            # Ventilador ligado ou desligado
            status_vent_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
            # Velocidade do ventilador
            vel_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
            # Status do ar condicionado
            status_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
            # Temperatura do ar condicionado
            temp_cool_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_COOL_AC_{room.upper()}")
            temp_heat_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_HEAT_AC_{room.upper()}")
            
            # Métricas personalizadas
            pmv_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"pmv_{room.upper()}")
            temp_op_max_hand = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_OP_MAX_ADAP_{room.upper()}")
            adaptativo_min = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MIN_{room.upper()}")
            adaptativo_max = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MAX_{room.upper()}")

            em_conforto_handler = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"EM_CONFORTO_{room.upper()}")

            # Métricas do EnergyPlus
            adaptativo_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature", f"PEOPLE_{room.upper()}")

            # Contagem de pessoas na sala
            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}"))
            #clo_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"PEOPLE_{room.upper()}")

            # Pegando todos os valores que são realmente necessários antes
            adaptativo = self.ep_api.exchange.get_variable_value(state, adaptativo_handle)

            temp_ar = self.ep_api.exchange.get_variable_value(state, temp_ar_handle)
            temp_op = self.ep_api.exchange.get_variable_value(state, temp_op_handle)
            temp_op_max = self.ep_api.exchange.get_actuator_value(state, temp_op_max_hand)

            # Temperatura media radiante
            mrt = self.ep_api.exchange.get_variable_value(state, mrt_handle)

            if people_count > 0.0:
                # Humidade relativa
                hum_rel = self.ep_api.exchange.get_variable_value(state, hum_rel_handle)

                # Roupagem
                #clo = self.ep_api.exchange.get_variable_value(state, clo_handle)
                clo = self.ep_api.exchange.get_actuator_value(state, clo_handle)

                temp_cool_ac = self.ep_api.exchange.get_actuator_value(state, temp_cool_ac_actuator)
                temp_heat_ac = self.ep_api.exchange.get_actuator_value(state, temp_heat_ac_actuator)

                # Valores iniciais
                status_janela = self.ep_api.exchange.get_actuator_value(state, status_janela_handle)
                status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
                vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)
                if self.fresh_start:
                    status_janela = 1.0 if temp_op > tdb else 0.0
                    status_ac = 0.0
                    vel = 0.0

                #if self.ep_api.exchange.current_time(state) % 1.0 == 0:
                #    status_ac = 0.0
                #    if temp_op > tdb:
                #        status_janela = 1.0

                temp_op_max = self.get_temp_max_op(vel)

                # Executar com o modelo adaptativo ou adaptativo com implemento
                if status_janela == 1.0:
                    # Executar com o modelo adaptativo
                    if temp_ar < tdb:
                        status_janela = 0.0
                        break

                    # Executar com o modelo adaptativo com incremento da velocidade
                    if temp_op > adaptativo + self.margem_adaptativo or temp_op < adaptativo - self.margem_adaptativo:
                        vel = self.get_vel_adap(temp_op)
                        vel = round(vel, 2)
                        if vel > self.vel_max:
                            vel = 1.2
                            status_ac = 1.0
                            status_janela = 0.0
                        temp_op_max = self.get_temp_max_op(vel)

                pmv = pythermalcomfort.models.pmv(
                    temp_ar,
                    mrt,
                    pythermalcomfort.utilities.v_relative(vel, self.met),
                    hum_rel,
                    self.met,
                    pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                    self.wme,
                    stardard='ashrae',
                    limit_inputs=False
                )
                
                # Executar com o modelo PMV
                if (pmv > self.pmv_upperbound or pmv < self.pmv_lowerbound) and status_janela == 0.0:
                    vel = self.get_best_velocity_with_pmv(temp_ar, mrt, vel, hum_rel, clo)                    
                    temp_cool_ac, temp_heat_ac = self.get_best_temperatures_with_pmv(mrt, vel, hum_rel, clo)

                # Mandando para o Energy os valores atualizados
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 1.0 if vel > 0.0 else 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, vel)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, status_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_cool_ac_actuator, temp_cool_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_heat_ac_actuator, temp_heat_ac)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, status_janela)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_hand, temp_op_max)
                self.ep_api.exchange.set_actuator_value(state, pmv_handle, pmv)
                print(f"{vel} | {status_ac} | {temp_cool_ac} | {temp_heat_ac} | {status_janela} | {temp_op_max} | {pmv}")
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_cool_ac_actuator, self.temp_ac_max)
                self.ep_api.exchange.set_actuator_value(state, temp_heat_ac_actuator, self.temp_ac_min)
                self.ep_api.exchange.set_actuator_value(state, pmv_handle, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, 1.0 if temp_ar > tdb else 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_hand, 0.0)

            self.ep_api.exchange.set_actuator_value(state, adaptativo_max, adaptativo + self.margem_adaptativo)
            self.ep_api.exchange.set_actuator_value(state, adaptativo_min, adaptativo - self.margem_adaptativo)
            em_conforto = 1.0 if people_count == 0.0 or (adaptativo >= temp_op - self.margem_adaptativo and adaptativo <= temp_op + self.margem_adaptativo and status_janela == 1.0 and vel == 0.0) or (temp_op <= temp_op_max and vel > 0.0 and status_janela == 1.0) or (pmv <= self.pmv_upperbound and pmv >= self.pmv_lowerbound and status_janela == 0.0) else 0.0
            self.ep_api.exchange.set_actuator_value(state, em_conforto_handler, em_conforto)

    def get_best_velocity_with_pmv(self, temp_ar, mrt, vel, hum_rel, clo):
        pmv = pythermalcomfort.models.pmv(
            temp_ar,
            mrt,
            pythermalcomfort.utilities.v_relative(vel, self.met),
            hum_rel,
            self.met,
            pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
            self.wme,
            stardard='ashrae',
            limit_inputs=False
        )
        
        while pmv > self.pmv_upperbound or pmv < self.pmv_lowerbound:
            if pmv > self.pmv_upperbound:
                vel = round(vel + 0.05, 2)
                if vel >= self.vel_max:
                    vel = 1.2
                    break
            else:
                vel = round(vel - 0.05, 2)
                if vel >= 0.0:
                    vel = 0.0
                    break

            pmv = pythermalcomfort.models.pmv(
                temp_ar,
                mrt,
                pythermalcomfort.utilities.v_relative(vel, self.met),
                hum_rel,
                self.met,
                pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                self.wme,
                stardard='ashrae',
                limit_inputs=False
            )

        return vel

    def get_best_temperatures_with_pmv(self, mrt, vel, hum_rel, clo):
        best_cool_temp = self.temp_ac_max
        best_heat_temp = self.temp_ac_min

        pmv = pythermalcomfort.models.pmv(
            best_cool_temp,
            mrt,
            pythermalcomfort.utilities.v_relative(vel, self.met),
            hum_rel,
            self.met,
            pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
            self.wme,
            stardard='ashrae',
            limit_inputs=False
        )

        while pmv > self.pmv_upperbound:
            best_cool_temp -= 1.0

            pmv = pythermalcomfort.models.pmv(
                best_cool_temp,
                mrt,
                pythermalcomfort.utilities.v_relative(vel, self.met),
                hum_rel,
                self.met,
                pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                self.wme,
                stardard='ashrae',
                limit_inputs=False
            )

        pmv = pythermalcomfort.models.pmv(
            best_heat_temp,
            mrt,
            pythermalcomfort.utilities.v_relative(vel, self.met),
            hum_rel,
            self.met,
            pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
            self.wme,
            stardard='ashrae',
            limit_inputs=False
        )

        while pmv < self.pmv_lowerbound:
            best_heat_temp += 1.0
            
            pmv = pythermalcomfort.models.pmv(
                best_heat_temp,
                mrt,
                pythermalcomfort.utilities.v_relative(vel, self.met),
                hum_rel,
                self.met,
                pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                self.wme,
                stardard='ashrae',
                limit_inputs=False
            )

        if best_heat_temp >= best_cool_temp:
            best_heat_temp = best_cool_temp - 1

        return best_cool_temp, best_heat_temp

    def get_temp_max_op(self, vel):
        return -0.3535 * vel ** 2 + 2.2758 * vel + 24.995
    
    def get_vel_adap(self, temp_op):
        return 0.055 * temp_op ** 2 - 2.331 * temp_op + 23.935 + 0.1