var sttipo = "tipo";
var sthtt = 'hosttype';
var stmpx = "multiplex";
var stjump = "jumpers";
var stcanal = 'canal';
var stallocelmod = 'allowed_on_cel_modem';
var sthostandport = 'hostname_and_port';
var stlkto = 'linked_to';
var sttooutside = 'to_outside';
var sttoinside = 'to_inside';
var stmodbustcp = 'modbus_tcp';
var strouter = 'router';
var stactive_wd = 'active_wd';
var stovpn = 'openvpn';
var stwebsec = 'websec';
var stdhcpserver = 'dhcp_server';
var stenabled = 'enabled';
var stipsec = 'ipsec';
var stuserapp = 'userapp';
var stdhcp = 'dhcp';
var stconversor = "conversor";
var stworker = 'worker';

var lang = {
    curr : 'en',
    t : function( mesg ) {
        var ret = mesg;
        if (  mesg in this.dict ) {
            if ( this.curr in this.dict[mesg]) {
                var ret = this.dict[mesg][this.curr];
            }
        }
        return ret;
    },
    dict : {
        'WORKING . . .' : {
            'pt' : 'TRABALHANDO . . . ',
        },
        'Equipment Reboot. Wait 1 minut and press F5 . . .' :{
            'pt' : 'Reboot do equipamento. Espere 1 minuto e pressione a tecla F5 ...',
        },
        'Hostname or IP of equipment to be configured' :{
            'pt':'Hostname ou IP do equipamento a ser configurado',
        },
        'Use this':{
            'pt':'Use este'
        },
        'Ethernet Port config':{
            'pt':'Porta Ethernet'
        },
        'Serial Port config':{
            'pt':'Porta Serial'
        },
        'Cellular dial config':{
            'pt':'Discagem Celular'
        },
        'Cellular PIN':{
            'pt':'Desbloqueio por PIN'
        },
        'Operator list manager':{
            'pt':'Lista de parâmetros de operadoras'
        },
        'DDNS services':{
            'pt':'Serviços de DDNS'
        },
        'AT Command':{
            'pt':'Comandos AT'
        },
        'TCP´s config':{
            'pt':'TCPs'
        },
        'FTP config':{
            'pt':'FTP'
        },
        'HTTP config':{
            'pt':'HTTP'
        },
        'IP Forwarding config':{
            'pt':'IP Forwarding'
        },
        'Router config':{
            'pt':'Configurar como roteador'
        },
        'Save new configs ':{
            'pt':'Salvar configurações '
        },
        'Pending ':{
            'pt':'Pendentes '
        },
        'Save pending':{
            'pt':'Salvamento pendente '
        },
        'Direct to modem':{
            'pt':'Direto no modem '
        },
        'Remote':{
            'pt':'Remoto '
        },
        'Serial port':{
            'pt':'Porta serial '
        },
        'PING test ':{
            'pt':'Teste de ping '
        },
        'DNS test':{
            'pt':'Teste de DNS'
        },
        'Return to factory configs':{
            'pt':'Configurações de fábrica'
        },
        'Firmware update':{
            'pt':'Atualizar o firmware'
        },
        'Reboot':{
            'pt':'Reboot do equipamento'
        },
        'Manual configuration edition':{
            'pt':'Configuração manual'
        },
        'OpenVPN config':{
            'pt':'OpenVPN configuração'
        },
        'IPSec config':{
            'pt':'IPSec configuração'
        },
        'View':{
            'pt':'Ver'
        },
        'Send':{
            'pt':'Enviar'
        },
        'Close':{
            'pt':'Fechar'
        },
        'Cancel':{
            'pt':'Cancelar'
        },
        'Get current':{
            'pt':'Ler atual'
        },
        'Save':{
            'pt':'Gravar'
        },
        'Start Download':{
            'pt':'Iniciar download'
        },
        'See log':{
            'pt':'Ver o log'
        },
        'Start Update':{
            'pt':'Iniciar atualização'
        },
        'New rule':{
            'pt':'Nova regra'
        },
        'Remove':{
            'pt':'Remover'
        },
        'remove':{
            'pt':'remover'
        },
        'Add internal':{
            'pt':'Adicionar interna'
        },
        'Add external':{
            'pt':'Adicionar externa'
        },
        'Add Host/Port':{
            'pt':'Mais um Host/Port'
        },
        'Add IP':{
            'pt':'Adicionar IP'
        },
        'Edit':{
            'pt':'Editar'
        },
        'WARNING: \n\nThis command erase current configuration to set to factory configurations. Confirm?':{
            'pt':'ATENÇÃO:\n\nEste comando destroi a configuração atual para colocar as de fábrica. Confirma?'
        },
        'WARNING: \n\nAre you sure do you whant to reboot equipment?':{
            'pt':'ATENÇÃO:\n\nConfirmas que queres rebootar o equipamento?'
        },
        'WARNING: \n\nThis command will replace current configuration. Configm?':{
            'pt':'ATENÇÃO:\n\nEste comando vai subtituir a configuração atual. Confirmas?'
        },
        'AT command':{
            'pt':'Envio de comandos AT para o modem'
        },
        'AT command: ':{
            'pt':'Comando AT: '
        },
        'Problem reading status from equipment. Check the IP or hostname, network connection, and try again.\n\n':{
            'pt':'Problema tentando ler o status do equipamento. Verifique o IP ou Hostname usado, a conexão de rede e tente novamente.\n\n'
        },
        'Firmware = ':{
            'pt':'Firmware = '
        },
        'Modem ID: ':{
            'pt':'Modem ID: '
        },
        'Time in seconds since poweron: ':{
            'pt':'Tempo em segundos desde que foi ligado: '
        },
        'Cellular Modem: ':{
            'pt':'Modem Celular: '
        },
        'disabled':{
            'pt':'desabilitado'
        },
        'enabled':{
            'pt':'habilitado'
        },
        'Signal':{
            'pt':'Sinal'
        },
        'APN':{
            'pt':'APN'
        },
        'APN: ':{
            'pt':'APN: '
        },
        'CONNECTED':{
            'pt':'CONECTADO'
        },
        'Ethernet cable ':{
            'pt':'Cabo Ethernet '
        },
        'connected as ':{
            'pt':'conectado como '
        },
        'disconnected':{
            'pt':'desconectado'
        },
        '    Totals: Rx ':{
            'pt':'    Totais: Rx '
        },
        '. Tx: ':{
            'pt':'. Tx: '
        },
        'TCP: client':{
            'pt':'TCP: cliente'
        },
        'TCP: server':{
            'pt':'TCP: servidor'
        },
        'Time in seconds since connection ':{
            'pt':'Tempo em segundos desde o inicio da conexão '
        },
        'Disconnected. ':{
            'pt':'Desconectado. '
        },
        ' connection attempts. ':{
            'pt':' tentativas de conexão. '
        },
        ' successful connections.':{
            'pt':' conexões realizadas.'
        },
        ' successful connections.':{
            'pt':' conexões realizadas.'
        },
        'Fail: ':{
            'pt':'Falha: '
        },
        'Check IP, hostname and network connection.':{
            'pt':'Veja se o equipamento está ligado e conectado na rede.'
        },
        'Equipment return some error:':{
            'pt':'Retornou algum erro do equipamento:'
        },
        'Result:':{
            'pt':'Resultado:'
        },
        'Problem sending new configuration to equipment. Check the IP or hostname, network connection, and try again.\n\n':{
            'pt':'Problema enviando a configuração para o equipamento. Verifique o IP ou hostname, e a conexão com a rede e tente novamente.\n\n'
        },
        'Problem reading current configuration from equipment. Check the IP or hostname, network connection, and try again.\n\n':{
            'pt':'Problema lendo a configuração atual do equipamento. Verifique o IP ou hostname, e a conexão com a rede e tente novamente.\n\n'
        },
        'Cellular dial configuration':{
            'pt':'Configuração da discagem do modem celular'
        },
        'Cellular modem: ':{
            'pt':'Modem celular: '
        },
        'DNS server: ':{
            'pt':'Servidor de DNS: '
        },
        'User name: ':{
            'pt':'User name: '
        },
        'Password: ':{
            'pt':'Senha: '
        },
        'Radio band (default 511): ':{
            'pt':'Radio band (padrão 511): '
        },
        'Operator list manager':{
            'pt':'Lista de parâmetros de operadoras'
        },
        'List: ':{
            'pt':'Lista de parâmetros: '
        },
        'DDNS service':{
            'pt':'Serviços de DDNS'
        },
        'Use No-IP':{
            'pt':'Use No-IP'
        },
        'Use DynDNS':{
            'pt':'Use DynDNS'
        },
        'Ethernet Port Configuration':{
            'pt':'Configuração da porta Ethernet'
        },
        'Ethernet Port Configuration':{
            'pt':'Configuração da porta Ethernet'
        },
        'IP address: ':{
            'pt':'Endereço IP: '
        },
        'Default gateway: ':{
            'pt':'Gateway padrão: '
        },
        'FTP configuration':{
            'pt':'Configuração FTP'
        },
        'When to use: ':{
            'pt':'Usar quando: '
        },
        'Never':{
            'pt':'Nunca'
        },
        'Trigger':{
            'pt':'Trigger'
        },
        'Always':{
            'pt':'Sempre'
        },
        'Tranfer kind: ':{
            'pt':'Tipo de transferência: '
        },
        'Append':{
            'pt':'Adicionar ao final'
        },
        'Store':{
            'pt':'Sobre escrever'
        },
        'Trigger pattern: ':{
            'pt':'Texto do trigger: '
        },
        'Firmware update':{
            'pt':'Atualização de firmware'
        },
        'URL to download packege: ':{
            'pt':'URL para buscar o pacote: '
        },
        'Timeout to download: ':{
            'pt':'Tempo máximo de espera pelo download: '
        },
        'Http configuration':{
            'pt':'Configuração de HTTP'
        },
        'Direction: ':{
            'pt':'Origem/Destino: '
        },
        'Cellular -> Ethernet':{
            'pt':'Celular -> Ethernet'
        },
        'Ethernet -> Cellular':{
            'pt':'Ethernet -> Celular'
        },
        'Protocol: ':{
            'pt':'Protocolo: '
        },
        'Destination IP: ':{
            'pt':'IP Destino: '
        },
        'Destination Port: ':{
            'pt':'Porta Destino: '
        },
        'Local Port(s): ':{
            'pt':'Porta(s) local(is): '
        },
        'IP Forwarding configuration':{
            'pt':'Configuração do IP Forwarding '
        },
        'Conectivity tests':{
            'pt':'Testes de conectividade'
        },
        'IP or hostname: ':{
            'pt':'IP ou hostname: '
        },
        'Cellular PIN':{
            'pt':'Desbloqueio do chip pelo PIN'
        },
        'Input PIN: ':{
            'pt':'Entre com o PIN: '
        },
        'Router configuration':{
            'pt':'Configurar como um roteador'
        },
        'Enable routing packets between cellular and Ethernet: ':{
            'pt':'Habilitar como um roteador permitindo trafegar dados entre a rede local e a celular: '
        },
        'Enable DHCP to Ethernet network: ':{
            'pt':'Habilitar como servidor de DHCP para a rede Ethernet: '
        },
        'Network address offset starts: ':{
            'pt':'Endereço entregues iniciam em: '
        },
        'Size of address pool: ':{
            'pt':'Quantidade máxima de IPs disponíveis: '
        },
        'Lease time: ':{
            'pt':'Tempo de validade: '
        },
        'Serial Port configuration':{
            'pt':'Configuração da porta serial'
        },
        'Internal connection ID: ':{
            'pt':'ID para as conexões internas: '
        },
        'External connection: ':{
            'pt':'Conexão Externa: '
        },
        'Connected to: ':{
            'pt':'Conectado em: '
        },
        'Type: ':{
            'pt':'Tipo: '
        },
        'TCP client':{
            'pt':'TCP cliente'
        },
        'TCP server':{
            'pt':'TCP servidor'
        },
        'Hosttype':{
            'pt':'Hosttype'
        },
        'Hostname and Port to connect':{
            'pt':'Hostname e Porta para conectar'
        },
        'Port: ':{
            'pt':'Porta: '
        },
        'Idle Timeout: ':{
            'pt':'Idle Timeout: '
        },
        'Modbus TCP: ':{
            'pt':'Modbus TCP: '
        },
        'Open access from Internet: ':{
            'pt':'Pode ser acessado pela Internet: '
        },
        'Yes':{
            'pt':'Sim'
        },
        'No':{
            'pt':'Não'
        },
        'Access control by IP: ':{
            'pt':'Controle de acesso por IP: '
        },
        'IP from: ':{
            'pt':'IP origem: '
        },
        'TCP configuration':{
            'pt':'Configuração TCP'
        },
        'Internal':{
            'pt':'Interna'
        },
        'External':{
            'pt':'Externa'
        },
        'Diagnostics & Tests':{
            'pt':'Testes e Diagnósticos'
        },
        'Select: ':{
            'pt':'Selecione: '
        },
        'ping':{
            'pt':'ping'
        },
        'System log':{
            'pt':'Log do sistema'
        },
        'Network trafic':{
            'pt':'Tráfego de rede'
        },
        'Download log File':{
            'pt':'Baixar o arquivo de log'
        },
        'Network Trafic. Tcpdump':{
            'pt':'Tráfego de rede. Tcpdump'
        },
        'Interface(s) to read: ':{
            'pt':'Interface(s) de rede a ser(em) lida(s)'
        },
        'Cellular':{
            'pt':'Celular'
        },
        'Ethernet':{
            'pt':'Ethernet'
        },
        'Both':{
            'pt':'As duas'
        },
        'File format: ':{
            'pt':'Formato de saída'
        },
        'Text':{
            'pt':'Texto'
        },
        'Binary':{
            'pt':'Binário'
        },
        'How long in minutes: ':{
            'pt':'Duração da coleta do log em minutos: '
        },
        'Start logging':{
            'pt':'Iniciar a coleta'
        },
        'Get log':{
            'pt':'Pegar o log'
        },
        'Download binary file from cellular':{
            'pt':'Baixar o arquivo binário do tráfego da rede celular'
        },
        'Download binary file from Ethernet':{
            'pt':'Baixar o arquivo binário do tráfego da rede Ethernet'
        },
        'Download text file from cellular':{
            'pt':'Baixar o arquivo texto do tráfego da rede celular'
        },
        'Download text file from Ethernet':{
            'pt':'Baixar o arquivo texto do tráfego da rede Ethernet'
        },
        'Web security':{
            'pt':'Segurança na web'
        },
        'Please enter your credentials':{
            'pt':'Favor entrar as credenciais'
        },
        'Login: ':{
            'pt':'Login: '
        },
        'Password: ':{
            'pt':'Senha: '
        },
        'Allow http access from cellular modem: ':{
            'pt':'Permitir acesso http vinda da rede celular: '
        },
        'Enforce use of password on http access: ':{
            'pt':'Permitir acessos somente com senha: '
        },
        'Change password: ':{
            'pt':'Fazer a troca de senha: '
        },
        'Current password: ':{
            'pt':'Senha atual: '
        },
        'New password: ':{
            'pt':'Nova senha: '
        },
        'IP allowed to access: ':{
            'pt':'IP permitido para acesso: '
        },
        'Serial ports':{
            'pt':'Portas seriais'
        },
        'Active watchdog':{
            'pt':'Verificação ativa de conectividade'
        },
        'Active watchdog on interface: ':{
            'pt':'Verificação ativa de conectividade na interface: '
        },
        'Select interface to test: ':{
            'pt':'Selecione a interface a ser testada: '
        },
        'IP to ping: ':{
            'pt':'IP a ser testado via ping: '
        },
        'Burst size: ':{
            'pt':'Número de pings enviados a cada teste: '
        },
        'Interval in seconds: ':{
            'pt':'Tempo entre envios em segundos: '
        },
        'Auto login profile: ':{
            'pt':'Perfil com autologin: '
        },
        'Max wait in seconds: ':{
            'pt':'Tempo máximo de espera pela resposta em segundos: '
        }
    }
}

function translate_elements() {

    if ( lang.curr == 'en') {
        return; // eh o padrao
    }
    $('.btn , .trl').each( function(e){
        var faz = true;
        var id = $(this).prev().prop('id');
        var val = $(this).val();
        var text = $(this).text();
        if ( text == null && id != null) {
            $('#' + id).text();
        }
        var tipo = $(this).prev().prop('nodeName');
        
        if ( faz) {
            if ( val != null && val.length > 0) {
                $(this).val( lang.t(val));
            }
            if ( text != null && text.length > 0) {
                $(this).text( lang.t(text));
            }
            // console.log( "id (" + id + ") tipo (" + tipo + ")   valor  (" + val + ")   text  (" + text + ")");
        }
    });
}

var special_configs = {}

function process_specials( parms) {
    // Aqui acerta os defaults para os specials
    special_configs = {
        'use_pro': false,
        'use_raw': false,
        'user_ser': false,
        'user_pt': false,

        'show_raw_config_json' : false,
        'show_tcp_modemid' : true,
        'show_not_in_raw' : true,
        'load_raw_config_to_editor' : false,
        'two_serial_ports' : false,
        'tcp_order_to_show' : 'inside_outside',
        'tcp_config_type': 'abs_mux',       // abs_mux ou tcp_serial
    
        'celmodem_available' : false,
        'active_wd_available' : false,
        
        'router_feature_available':false,
        'router_feature_on_link':false,
        'dhcp_exclusive_config':false,
        'websec_feature_available':false,
        'systemlog_feature_available':false,
        'network_trafic_feature_available':false,
    
        'ovpn_feature_available':false,
        'ipsec_feature_available':false,
        'change_config_ip_feature_available':false,
        'scheduled_reboot_feature_available':false,
        'dmz_config_feature_available':false,
        'fw_multisrc_config_feature_available':false,
        'static_routes_feature_available':false,
        'network_features_available':true,
        'userapp_features_available':true,
        'ping_keepalive_wan_feature_available': false,
        'eth_usb_feature_available': false,
        'ovpn_zone_name':false,
        'http_trigger_post_available':false,
        'routing_ipsec_wan_available':false,
    }
    var args = parms.split('?');
    for ( var i in args) {
        if ( args[i] == 'pro') {
            special_configs['use_pro'] = true;
            special_configs['show_raw_config_json'] = true;
        } else if ( args[i] == 'ser') {
            special_configs['use_ser'] = true;
            special_configs['two_serial_ports'] = true;
        } else if ( args[i] == 'pt') {
            special_configs['use_pt'] = true;

            lang.curr = 'pt';
        } else if ( args[i] == 'raw') {
            special_configs['use_raw'] = true;

            special_configs['show_raw_config_json'] = true;
            special_configs['show_not_in_raw'] = false;
            special_configs['load_raw_config_to_editor'] = true;
        }
    }
}

// Aqui eh chamado para rodar. Mas pode ser chamado por outras funcoes.
process_specials($(location).attr('search'));


function process_specials_by_status() {
    console.log("Entrou na process_specials_by_status");
    // Acertar os defaults
    process_specials($(location).attr('search'));
    // Seguir no processamento
    special_configs['celmodem_available'] = false;
    special_configs['active_wd_available'] = false;
    special_configs['router_feature_available'] = false;
    special_configs['websec_feature_available'] = false;
    special_configs['systemlog_feature_available'] = false;
    special_configs['network_trafic_feature_available'] = false;

    var staux = 'result_code';
    if ( status_current != null && staux in status_current && status_current[staux] >= 200 && status_current[staux] < 300) {
        var dados = status_current['data'];
        var cred = dados['credentials'];
        var r_name = cred['release_name'];
        var r_partnum = parseInt(cred['part_number']);
        var r_ver = parseFloat(cred['version']);
        var r_date= parseInt(cred['release_date']);
        console.log("R_VER " + r_ver);
        if(r_partnum == 3 || r_partnum == 4) {
            staux = 'cel_modem';
            if ( staux in dados) {
                special_configs['celmodem_available'] = true;
            } else {
                special_configs['celmodem_available'] = false;
            }
            staux = 'wd_active_connection';
            if ( staux in dados) {
                console.log('Tem a sessao ' + staux);
                special_configs['active_wd_available'] = true;
            } else {
                console.log('Tem não a sessao ' + staux);
                special_configs['active_wd_available'] = false;
            }

            if ( r_ver > 2.11) {
                special_configs['router_feature_available'] = true;
            }
            if ( r_ver > 2.12) {
                special_configs['websec_feature_available'] = true;
                special_configs['systemlog_feature_available'] = true;
                special_configs['network_trafic_feature_available'] = true;
            }
            if ( r_ver > 2.14) {
                special_configs['ovpn_feature_available'] = true;
            }
            if ( r_ver == 2.18) {
                special_configs['ovpn_zone_name'] = "myvpnc_fw";
            }
            if ( r_ver > 2.18) {
                special_configs['ovpn_zone_name'] = "openvpn_fw";
            }
            if ( r_ver > 2.19) {
                special_configs['router_feature_on_link'] = true;
                special_configs['dhcp_exclusive_config'] = true;
                special_configs['change_config_ip_feature_available'] = true;
                special_configs['scheduled_reboot_feature_available'] = true;
                special_configs['dmz_config_feature_available'] = true;
                special_configs['fw_multisrc_config_feature_available'] = true;
                special_configs['ipsec_feature_available'] = true;
                special_configs['static_routes_feature_available'] = true;
            }
            if ( r_ver > 2.20) {
                if (special_configs['use_pro']) {
                    special_configs['userapp_feature_available'] = true;
                }
                special_configs['ping_keepalive_wan_feature_available'] = true;
                if (r_partnum == 4) {
                    special_configs['eth_usb_feature_available'] = true
                }
            }
            if (r_ver > 2.21) {
                special_configs['http_trigger_post_available'] = true;
            }
            if ( r_ver > 2.22) {
                if (special_configs['use_pro']) {
                    special_configs['userapp_feature_available'] = true;
                }
            }
            if ( r_ver > 2.23) {
                special_configs['routing_ipsec_wan_available'] = true;
            }
        } else if(r_partnum == 1 || r_partnum == 2) {
        // PART NUMBER 1 e 2     Ether x serial
            special_configs['network_features_available']  = false;
            if ( r_ver > 2.12) {
                special_configs['websec_feature_available'] = true;
            }
        }
    }
}
