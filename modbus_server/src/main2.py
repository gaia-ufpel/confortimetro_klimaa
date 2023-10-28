import os
import sys
import time
from pyModbusTCP.server import DataBank, ModbusServer, DataHandler

class MyDataHandler(DataHandler):
    def read_coils(self, address, count, srv_info):
        if srv_info.client.address in ALLOW_R_L:
            return super().read_coils(address, count, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

    def read_d_inputs(self, address, count, srv_info):
        if srv_info.client.address in ALLOW_R_L:
            return super().read_d_inputs(address, count, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

    def read_h_regs(self, address, count, srv_info):
        if srv_info.client.address in ALLOW_R_L:
            return super().read_h_regs(address, count, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

    def read_i_regs(self, address, count, srv_info):
        if srv_info.client.address in ALLOW_R_L:
            return super().read_i_regs(address, count, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

    def write_coils(self, address, bits_l, srv_info):
        if srv_info.client.address in ALLOW_W_L:
            return super().write_coils(address, bits_l, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

    def write_h_regs(self, address, words_l, srv_info):
        if srv_info.client.address in ALLOW_W_L:
            return super().write_h_regs(address, words_l, srv_info)
        else:
            return DataHandler.Return(exp_code=EXP_ILLEGAL_FUNCTION)

def main():
    server = ModbusServer(host="0.0.0.0", port=5020, no_block=True)
    db = DataBank()

    server.start()
    while True:
        time.sleep(5)
        print(db.get_holding_registers(64000, 1))


if __name__ == "__main__":
    main()