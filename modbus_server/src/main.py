import asyncio
import os
import sys
import logging
import time

import pymodbus
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusServerContext, ModbusSlaveContext
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.server import StartAsyncTcpServer
from pymodbus.transaction import ModbusSocketFramer

import psycopg
import toml

LOGS_PATH = os.getenv("LOGS_PATH")

if not os.path.exists(LOGS_PATH):
    os.makedirs(LOGS_PATH)

logging.basicConfig(filename=os.path.join(LOGS_PATH, "logs.log"), format='%(asctime)s - %(message)s')
_logger = logging.getLogger(__file__)
_logger.setLevel(logging.INFO)
_logger.addHandler(logging.StreamHandler(sys.stdout))

def read_config(filename: str):
    text = None

    with open(filename, 'r') as reader:
        text = reader.read()

    return toml.loads(text)

def setup_slaves(clients):
    slaves_context = dict()

    for i, client_config in clients.items():
        datablock = ModbusSequentialDataBlock(0x00, [0x00] * client_config['mem_len'])
        store = ModbusSlaveContext(
            di=datablock,
            co=datablock,
            hr=datablock,
            ir=datablock,
            zero_mode=True
        )
        slaves_context.update({
            int(i) : store
        })

    return slaves_context

def setup_identity():
    return ModbusDeviceIdentification(
        info_name={
            "VendorName": "Pymodbus",
            "ProductCode": "PM",
            "VendorUrl": "https://github.com/pymodbus-dev/pymodbus/",
            "ProductName": "Pymodbus Server",
            "ModelName": "Pymodbus Server",
            "MajorMinorRevision": pymodbus.__version__,
        }
    )

def setup_framer():
    return ModbusSocketFramer

async def updating_task(context):
    """Update values in server.

    This task runs continuously beside the server
    (via asyncio.create_task in run_updating_server).
    It will increment some values each two seconds.

    It should be noted that getValues and setValues are not safe
    against concurrent use.
    """

    fc_as_hex = 4
    slave_id = 0x01
    address = 64200
    count = 1

    # set values to zero
    values = context[slave_id].getValues(fc_as_hex, address, count=count)
    values = [0 for v in values]
    context[slave_id].setValues(fc_as_hex, address, values)

    txt = (
        f"updating_task: started: initialised values: {values!s} at address {address!s}"
    )
    print(txt)
    _logger.debug(txt)

    # incrementing loop
    while True:
        await asyncio.sleep(2)

        values = context[slave_id].getValues(fc_as_hex, address, count=count)
        values = [v + 1 for v in values]
        context[slave_id].setValues(fc_as_hex, address, values)

        txt = f"updating_task: incremented values: {values!s} at address {address!s}"
        print(txt)
        _logger.debug(txt)

async def main():
    _logger.info("Reading configs")

    config = read_config("config.toml")

    _logger.info("Starting setup")
    
    address = (config['servers']['modbus']['host'], int(config['servers']['modbus']['port']))
    block = ModbusSequentialDataBlock(0x00, [0x00] * 65536)
    #server_context = ModbusServerContext(slaves={1: block}, single=True)
    #slaves_context = setup_slaves(config['clients'])
    context = ModbusSlaveContext(di=block, co=block, hr=block, ir=block)
    #server_context = ModbusServerContext(slaves=slaves_context, single=False if len(slaves_context) > 1 else True)
    context = ModbusServerContext(slaves=context, single=True)
    identity = setup_identity()
    framer = setup_framer()

    _logger.info(f"Setup complete")
    _logger.info(f"Starting server at {address[0]}:{address[1]}")

    #task = asyncio.create_task(updating_task(context))

    await StartAsyncTcpServer(
        context=context,
        identity=identity,
        address=address,
        framer=framer,
        #timeout=1,
        #custom_functions=[],
        #broadcast_enabled=False,
        #ignore_missing_slaves=True
    )

    #task.cancel()

if __name__ == "__main__":
    """
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    read_task = asyncio.create_task(read_registers())

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server.close()
        loop.run_until_complete(server.shutdown())
        loop.run_until_complete(server.wait_closed())
        loop.close()
    """
    asyncio.run(main(), debug=True)