import time
from pyModbusTCP.client import ModbusClient


# init modbus client
c = ModbusClient(host='192.168.1.9', port=5901, debug=False, auto_open=True)

# main read loop
while True:
    # read 10 registers at address 0, store result in regs list
    regs_l = c.read_holding_registers(64020, 1)
    coils_l = c.read_coils(64020, 10)

    print(regs_l)
    print(coils_l)

    # if success display registers
    # sleep 2s before next polling
    time.sleep(5)