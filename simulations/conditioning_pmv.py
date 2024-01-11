import pythermalcomfort

TEMPERATURES = []
TEMPERATURES_DAY = []

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
        self.air_conditioning = True
        self.ac_checker_counter = 6
        self.ac_checker_interval = 6
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        tdb_handle = self.ep_api.exchange.get_variable_handle(state, "Site Outdoor Air Drybulb Temperature", "Environment")
        tdb = self.ep_api.exchange.get_variable_value(state, tdb_handle)

        if len(TEMPERATURES_DAY) >= 120:
            media = 0
            for t in TEMPERATURES_DAY:
                media += t
            media = media / 120
            TEMPERATURES_DAY.clear()
            TEMPERATURES.insert(0, media)
            
            if len(TEMPERATURES) > 30:
                TEMPERATURES.pop()

        media_temperatura_rua = 0
        if len(TEMPERATURES) >= 7:
            media_temperatura_rua = pythermalcomfort.utilities.running_mean_outdoor_temperature(
                TEMPERATURES
            )

        for room in self.rooms:
            temp_ar_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room)

            mrt_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Mean Radiant Temperature", room)

            hum_rel_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air Relative Humidity", room)

            temp_op_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Operative Temperature", room)

            clo_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"PEOPLE_{room.upper()}")

            status_janela_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"JANELA_{room.upper()}")

            # Ventilador ligado ou desligado
            status_vent_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
        
            # Velocidade do ventilador
            vel_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
                    
            # Status do ar condicionado
            status_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
                    
            # Temperatura do ar condicionado
            temp_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_AC_{room.upper()}")
            
            pmv_pythermal_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"PMV_PYTHERMAL_{room.upper()}")

            adaptativo_pythermal_handle = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAPTATIVO_PYTHERMAL_{room.upper()}")

            temp_op_max_hand = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_OP_MAX_ADAP_{room.upper()}")

            adaptativo_min = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MIN_{room.upper()}")

            adaptativo_max = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"ADAP_MAX_{room.upper()}")

            em_conforto_hand = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"EM_CONFORTO_{room.upper()}")

            pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"PEOPLE_{room.upper()}")
            
            adaptativo_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature", f"PEOPLE_{room.upper()}")

            co2_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air CO2 Concentration", f"{room.upper()}")

            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}"))

            pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)
            adaptativo = self.ep_api.exchange.get_variable_value(state, adaptativo_handle)

            status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
            vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)
            temp_op = self.ep_api.exchange.get_variable_value(state, temp_op_handle)
            temp_op_max = self.ep_api.exchange.get_actuator_value(state, temp_op_max_hand)

            pmv_pythermal = 0.0
            with_pmv = False

            # Temperatura media radiante
            mrt = self.ep_api.exchange.get_variable_value(state, mrt_handle)

            adaptativo_pythermal = pythermalcomfort.models.adaptive_ashrae(tdb, mrt, media_temperatura_rua, vel, limit_inputs=False)

            if people_count > 0.0:
                # Temperatura do ar
                temp_ar = self.ep_api.exchange.get_variable_value(state, temp_ar_handle)
        
                # Humidade relativa
                hum_rel = self.ep_api.exchange.get_variable_value(state, hum_rel_handle)
                # Roupagem
                clo = self.ep_api.exchange.get_variable_value(state, clo_handle)

                co2 = self.ep_api.exchange.get_variable_value(state, co2_handle)

                temp_ac = self.ep_api.exchange.get_actuator_value(state, temp_ac_actuator)
                
                status_janela = self.ep_api.exchange.get_actuator_value(state, status_janela_handle)

                temp_op_max = self.get_temp_max_op(vel)

                if self.ep_api.exchange.current_time(state) % 1.0 == 0:
                    status_ac = 0.0
                    if temp_op < tdb:
                        status_janela = 1.0

                if co2 > 900.0:
                    print(co2)
                    status_ac = 1.0
                    status_janela = 0.0

                if status_ac == 0.0:
                    # Executar com o modelo adaptativo
                    if vel == 0.0:
                        if adaptativo - self.margem_adaptativo > temp_op:
                            status_janela = 0.0
                        elif adaptativo + self.margem_adaptativo < temp_op and temp_op > tdb:
                            status_janela = 1.0
                    if temp_op > temp_op_max:
                        # Executar com o modelo adaptativo com incremento da velocidade
                        if temp_op >= 25.0 and temp_op <= 27.2:
                            vel = self.get_vel_adap(temp_op)
                            vel = round(vel, 2)
                            if vel > self.vel_max:
                                vel = 1.2
                                status_ac = 1.0
                                status_janela = 0.0
                            temp_op_max = self.get_temp_max_op(vel)
                        # Para transiçao entre o modelo adaptativo e o modelo pmv
                        else:
                            vel = 1.2
                            status_janela = 0.0
                            temp_op_max = self.get_temp_max_op(vel)
                
                pmv_pythermal = pythermalcomfort.models.pmv(
                        temp_op,
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
                if (pmv_pythermal > self.pmv_upperbound or pmv_pythermal < self.pmv_lowerbound) and status_janela == 0.0:
                    if status_ac == 1.0:
                        if pmv_pythermal < self.pmv_lowerbound:
                            temp_ac = self.temp_ac_min
                        elif pmv_pythermal > self.pmv_upperbound:
                            temp_ac = self.temp_ac_max

                        while pmv_pythermal > self.pmv_upperbound or pmv_pythermal < self.pmv_lowerbound:
                            if pmv_pythermal > self.pmv_upperbound:
                                if vel < self.vel_max:
                                    vel = round(vel + 0.05, 2)
                                elif temp_ac > self.temp_ac_min:
                                    temp_ac -= 1.0
                                else:
                                    break

                            elif pmv_pythermal < self.pmv_lowerbound:
                                if status_ac == 1.0 and temp_ac < self.temp_ac_max:
                                    temp_ac += 1.0
                                elif vel > 0.0 and status_ac == 0.0:
                                    vel = round(vel - 0.05, 2)
                                    if vel < 0.0:
                                        vel = 0.0
                                elif status_ac == 1.0:
                                    status_ac = 0.0
                                    status_janela = 1.0          
                                else:
                                    break

                            pmv_pythermal = pythermalcomfort.models.pmv(
                                temp_op if status_ac == 0.0 else temp_ac,
                                mrt,
                                pythermalcomfort.utilities.v_relative(vel, self.met),
                                hum_rel,
                                self.met,
                                pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                                self.wme,
                                stardard='ashrae',
                                limit_inputs=False
                            )
                    else:
                        while pmv_pythermal > self.pmv_upperbound or pmv_pythermal < self.pmv_lowerbound:
                            if pmv_pythermal > self.pmv_upperbound:
                                if vel < self.vel_max:
                                    vel = round(vel + 0.05, 2)
                                else:
                                    vel = 1.2
                                    status_ac = 1.0
                                    status_janela = 0.0
                                    break

                            elif pmv_pythermal < self.pmv_lowerbound:
                                if vel > 0.0:
                                    vel = round(vel - 0.05, 2)
                                    if vel < 0.0:
                                        vel = 0.0
                                else:
                                    status_ac = 1.0
                                    status_janela = 0.0
                                    break

                            pmv_pythermal = pythermalcomfort.models.pmv(
                                temp_op,
                                mrt,
                                pythermalcomfort.utilities.v_relative(vel, self.met),
                                hum_rel,
                                self.met,
                                pythermalcomfort.utilities.clo_dynamic(clo, met=self.met),
                                self.wme,
                                stardard='ashrae',
                                limit_inputs=False
                            )

                # Mandando para o Energy os valores atualizados
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 1.0 if vel > 0.0 else 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, vel)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, status_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, temp_ac)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, status_janela)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_hand, temp_op_max)
                self.ep_api.exchange.set_actuator_value(state, pmv_pythermal_handle, pmv_pythermal)
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, 24.0)
                self.ep_api.exchange.set_actuator_value(state, pmv_pythermal_handle, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, 1.0)
                self.ep_api.exchange.set_actuator_value(state, temp_op_max_hand, 0.0)

            self.ep_api.exchange.set_actuator_value(state, adaptativo_max, adaptativo + self.margem_adaptativo)
            self.ep_api.exchange.set_actuator_value(state, adaptativo_min, adaptativo - self.margem_adaptativo)
            em_conforto = 1.0 if people_count == 0.0 or (adaptativo >= temp_op - self.margem_adaptativo and adaptativo <= temp_op + self.margem_adaptativo and status_janela == 1.0 and vel == 0.0) or (temp_op <= temp_op_max and vel > 0.0) or (pmv_pythermal <= self.pmv_upperbound and pmv_pythermal >= self.pmv_lowerbound and (status_janela == 0.0 or with_pmv)) else 0.0
            self.ep_api.exchange.set_actuator_value(state, em_conforto_hand, em_conforto)

    def get_temp_max_op(self, vel):
        return -0.3535 * vel ** 2 + 2.2758 * vel + 24.995
    
    def get_vel_adap(self, temp_op):
        return 0.055 * temp_op ** 2 - 2.331 * temp_op + 23.935 + 0.1