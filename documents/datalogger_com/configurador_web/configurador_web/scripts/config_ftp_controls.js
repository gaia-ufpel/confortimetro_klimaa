
var div_config_ftp = null;

get_html('config_ftp');

function ftp_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ftp == null) {
        div_config_ftp = $('#config_ftp_html').html();
        $('#config_ftp_html').remove();
    }
}

function ftp_set_view() {
    // console.log("ftp_set_view " + $('#ftp_dhcp_conf').children("option:selected").val());
    if ($('#ftp_usemode_conf').children("option:selected").val() == 'off') {
        $( '#div_ftp_enabled').hide();
    } else {
        $( '#div_ftp_enabled').show();
    }
    if ($('#ftp_usemode_conf').children("option:selected").val() == 'always') {
        $( '#ftp_trigger_user').prop('disabled', true);
    } else {
        $( '#ftp_trigger_user').prop('disabled', false);
    }
}

function ftp_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ftp');
}

function ftp_config_show() {
    console.log("entrou ftp_config_show");
    block_other_acctions();
    ftp_prepare_html();
    // limpar as divs que apresentam os dados
    var already_open = tags_configurar_show( 'ftp', div_config_ftp);
    if ( ! already_open) {
        if ( ! ( 'ftp' in config_to_save)) {
            config_to_save['ftp'] = {
                "tipo":"ftp",
                "usemode": "off",
                "trigger": "ABSMSGNS",
                "trigger_user": "ftpput/a",
                "hostname": "",
                "hostport": "",
                "timeout": "60",
                "user": "",
                "password": "",
                "dir": "",
                "filename": "",
                "transfer_cmd": "APPE"
            };
        }
        $('#ftp_usemode_conf').val(config_to_save['ftp']['usemode']);
        var parms = {
            'host' : config_to_save['ftp']['hostname'],
            'port' : config_to_save['ftp']['hostport'],
            'path' : config_to_save['ftp']['dir'],
        };
        $('#ftp_url_config').val(buildUri( parms));
        $('#ftp_transfer_timeout').val(config_to_save['ftp']['timeout']);
        $('#ftp_username').val(config_to_save['ftp']['user']);
        $('#ftp_password').val(config_to_save['ftp']['password']);
        $('#ftp_transfer_command').val(config_to_save['ftp']['transfer_cmd']);
        $('#ftp_trigger_user').val(config_to_save['ftp']['trigger_user']);
        ftp_set_view();
    }
}

function ftp_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'ftp' in config_to_save)) {
        config_to_save['ftp'] = {};
    }
    var urldividida = parseUri( $('#ftp_url_config').val());
    console.log("FTP url dividida " + JSON.stringify(urldividida, null, 4));

    config_to_save['ftp']['tipo'] = 'ftp';
    config_to_save['ftp']['usemode'] = $('#ftp_usemode_conf').val();
    config_to_save['ftp']['hostname'] = urldividida['host'];
    config_to_save['ftp']['hostport'] = urldividida['port'];
    config_to_save['ftp']['dir'] = urldividida['path'];
    config_to_save['ftp']['user'] = urldividida['user'];
    config_to_save['ftp']['password'] = urldividida['password'];
    var user = $('#ftp_username').val();
    if ( user != null && user.length > 0) {
        config_to_save['ftp']['user'] = user;
    }
    var pwd = $('#ftp_password').val();
    if ( pwd != null && user.length > 0) {
        config_to_save['ftp']['password'] = pwd;
    }
    config_to_save['ftp']['transfer_cmd'] = $('#ftp_transfer_command').val();
    config_to_save['ftp']['trigger_user'] = $('#ftp_trigger_user').val();
    tags_configurar_close( 'ftp');
    config_has_been_changed('ftp')
    set_conversor_config_show_changes_on_page();
}