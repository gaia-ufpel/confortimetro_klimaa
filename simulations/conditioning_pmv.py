import pythermalcomfort

class ConditioningPmv:
    def __init__(self, ep_api, rooms, pmv_upperbound=0.5, pmv_lowerbound=-0.5, vel_max=1.35, temp_ac_min=14, temp_ac_max=32, reduce_consume=False, met=1.2, wme=0.0):
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
        
    def __call__(self, state):
        if self.ep_api.exchange.warmup_flag(state):
            return
            
        for room in self.rooms:
            # Ventilador ligado ou desligado
            status_vent_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VENT_{room.upper()}")
        
            # Velocidade do ventilador
            vel_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"VEL_{room.upper()}")
                    
            # Status do ar condicionado
            status_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"AC_{room.upper()}")
                    
            # Temperatura do ar condicionado
            temp_ac_actuator = self.ep_api.exchange.get_actuator_handle(state, "Schedule:Constant", "Schedule Value", f"TEMP_AC_{room.upper()}")
            
            people_count = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "People Occupant Count", f"PEOPLE_{room.upper()}"))
            
            if people_count > 0.0:   
                # PMV da zona
                pmv_handle = self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Fanger Model PMV", f"PEOPLE_{room.upper()}")
                pmv = self.ep_api.exchange.get_variable_value(state, pmv_handle)
                
                if pmv < self.pmv_lowerbound or pmv > self.pmv_upperbound:
                    if pmv < self.pmv_lowerbound:
                        temp_ac = self.temp_ac_min
                    else:
                        temp_ac = self.temp_ac_max

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
                    clo = self.ep_api.exchange.get_variable_value(state, self.ep_api.exchange.get_variable_handle(state, "Zone Thermal Comfort Clothing Value", f"PEOPLE_{room.upper()}"))
                
                    pmv_pythermal = pythermalcomfort.models.pmv(
                        temp_interna,
                        mrt,
                        vel,
                        hum_rel,
                        self.met,
                        clo,
                        self.wme,
                        stardard='ashrae',
                        limit_inputs=False
                    )

                    # -----------------------------------------
                    # Corrigindo o PMV ------------------------
                    while pmv_pythermal > self.pmv_upperbound:
                        if vel < self.vel_max:
                            vel = round(vel + 0.05, 2)
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif status_ac == 1.0:
                            temp_ac += 1.0
                        else:
                            break

                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            self.met,
                            clo,
                            self.wme,
                            stardard='ashrae',
                            limit_inputs=False
                        )   

                    while pmv_pythermal < self.pmv_lowerbound:
                        if vel > 0.0:
                            vel = round(vel - 0.05, 2)
                            status_vent = 1
                        elif status_ac == 0.0:
                            status_ac = 1.0
                        elif status_ac == 1.0:
                            temp_ac += 1.0
                        else:
                            break

                        pmv_pythermal = pythermalcomfort.models.pmv(
                            temp_ac if status_ac == 1 else temp_interna,
                            mrt,
                            vel,
                            hum_rel,
                            self.met,
                            clo,
                            self.wme,
                            stardard='ashrae',
                            limit_inputs=False
                        )

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