from pymodbus.client import ModbusTcpClient
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusServerContext
from pymodbus.transaction import ModbusSocketFramer

def some_calls(client):
    try:
        rr = client.read_holding_registers(64200, 1, slave=0)
        #rr = client.read_input_registers(64200, 1, slave=1)
        if rr.isError():
            print(rr.message)
        else:
            print(rr.registers[0])
    except Exception as ex:
        print(ex)

def check_slaves(client):
    for slave_id in range(1, 5):
        try:
            # Tente acessar um dispositivo no slave
            result = client.read_holding_registers(0, 1, unit=slave_id)

            # Se não ocorrer erro, o slave está disponível
            if not result.isError():
                print(f"Slave {slave_id} está ativo")
        
        except Exception as e:
            # Se ocorrer um erro, o slave não está disponível
            print(f"Erro ao acessar o Slave {slave_id}: {str(e)}")

if __name__ == "__main__":
    client = ModbusTcpClient(host="192.168.1.13", port=5901, framer=ModbusSocketFramer, timeout=32)
    client.connect()
    some_calls(client)
    #check_slaves(client)
    client.close()