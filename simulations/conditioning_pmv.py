import pythermalcomfort

class ConditioningPmv:
    def __init__(self, ep_api, rooms, pmv_upperbound=0.5, pmv_lowerbound=-0.5, vel_max=1.2, temp_ac_min=14, temp_ac_max=32, reduce_consume=False, met=1.2, wme=0.0):
        self.ep_api = ep_api
        self.rooms = rooms
        self.pmv_upperbound = pmv_upperbound
        self.pmv_lowerbound = pmv_lowerbound
        self.vel_max = vel_max
        self.temp_ac_min = temp_ac_min
        self.temp_ac_max = temp_ac_max
        self.reduce_consume = reduce_consume
        self.met = met
        self.wme = wme
        self.air_conditioning = True
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        for room in self.rooms:
            margem_ashrae = 2.5

            temp_inter_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Air Temperature", room)

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
            
            # 
            pmv_pt = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"PMV_PYTHERMAL")

            pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"PEOPLE_{room.upper()}")
            
            ashrae_55_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort ASHRAE 55 Adaptive Model Temperature", f"PEOPLE_{room.upper()}")

            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}"))
        
            if people_count > 0.0:
                # PMV da zona e ASHRAE 55
                pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)
                ashrae_55 = self.ep_api.exchange.get_variable_value(state, ashrae_55_handle)
                # Ar condicionado ligado ou desligado
                status_ac = self.ep_api.exchange.get_actuator_value(state, status_ac_actuator)
                vel = self.ep_api.exchange.get_actuator_value(state, vel_actuator)            
                # Temperatura do ar
                temp_interna = self.ep_api.exchange.get_variable_value(state, temp_inter_handle)
                temp_op = self.ep_api.exchange.get_variable_value(state, temp_op_handle)
                # Temperatura media radiante
                mrt = self.ep_api.exchange.get_variable_value(state, mrt_handle)
                # Humidade relativa
                hum_rel = self.ep_api.exchange.get_variable_value(state, hum_rel_handle)
                # Roupagem
                clo = self.ep_api.exchange.get_variable_value(state, clo_handle)
                temp_ac = self.ep_api.exchange.get_actuator_value(state, temp_ac_actuator)
                status_janela = self.ep_api.exchange.get_actuator_value(state, status_janela_handle)

                if status_ac == 0.0 and ashrae_55 >= 25.0 and ashrae_55 <= 27.0:
                    status_janela = self.ep_api.exchange.get_actuator_value(state, status_janela_handle)

                    if ashrae_55 < temp_op - margem_ashrae or ashrae_55 > temp_op + margem_ashrae:
                        if status_janela == 0.0:
                            status_janela = 1.0
                        else:
                            vel = 0.055 * temp_op ** 2 - 2.331 * temp_op + 23.935
                            vel = round(vel, 2)

                elif status_ac == 1.0 and (pmv > self.pmv_upperbound or pmv < self.pmv_lowerbound):
                    if pmv < self.pmv_lowerbound:
                        temp_ac = self.temp_ac_min
                    elif pmv > self.pmv_upperbound:
                        temp_ac = self.temp_ac_max

                    pmv_pythermal = pythermalcomfort.models.pmv(
                        temp_interna if status_ac == 0.0 else temp_ac,
                        mrt,
                        vel,
                        hum_rel,
                        self.met,
                        clo,
                        self.wme,
                        stardard='ashrae',
                        limit_inputs=False
                    )

                    while pmv_pythermal > self.pmv_upperbound or pmv_pythermal < self.pmv_lowerbound:
                        if pmv_pythermal > self.pmv_upperbound:
                            if status_janela == 0.0:
                                status_janela = 1.0
                            elif vel < self.vel_max and status_ac == 0.0:
                                vel = round(vel + 0.05, 2)
                            elif status_ac == 0.0:
                                status_janela = 0.0
                                status_ac = 1.0
                            elif status_ac == 1.0 and temp_ac > self.temp_ac_min:
                                temp_ac -= 1.0
                            else:
                                break

                        elif pmv_pythermal < self.pmv_lowerbound:
                            if status_janela == 0.0:
                                status_janela = 1.0
                            elif vel > 0.0 and status_ac == 0.0:
                                vel = round(vel - 0.05, 2)
                                status_vent = 1.0
                            elif status_ac == 0.0:
                                status_ac = 1.0
                                status_janela = 0.0
                            elif status_ac == 1.0 and temp_ac < self.temp_ac_max:
                                temp_ac += 1.0
                            else:
                                break

                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_interna if status_ac == 0.0 else temp_ac,
                            mrt,
                            vel,
                            hum_rel,
                            self.met,
                            clo,
                            self.wme,
                            stardard='ashrae',
                            limit_inputs=False
                        )

                    self.ep_api.exchange.set_actuator_value(state, pmv_pt, pmv_pythermal)

                # Mandando para o Energy os valores atualizados                           
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 1.0 if vel > 0.0 else 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, vel)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, status_ac)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, temp_ac)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, status_janela)
            else:
                # Desligando tudo se não há ocupação
                self.ep_api.exchange.set_actuator_value(state, status_vent_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, vel_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_ac_actuator, 0.0)
                self.ep_api.exchange.set_actuator_value(state, temp_ac_actuator, 24.0)
                self.ep_api.exchange.set_actuator_value(state, pmv_pt, 0.0)
                self.ep_api.exchange.set_actuator_value(state, status_janela_handle, 1.0)