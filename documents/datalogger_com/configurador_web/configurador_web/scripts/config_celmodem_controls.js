
var div_config_celmodem = null;

get_html('config_celmodem');

function celmodem_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_celmodem == null) {
        div_config_celmodem = $('#config_celmodem_html').html();
        $('#config_celmodem_html').remove();
    }
}

function celmodem_set_view() {
    if ($('#celmodem_enable').children("option:selected").val() == '1') {
        $( '#div_celmodem_enabled_config').show();
        if (special_configs['router_feature_on_link'])         $( '#div_celmodem_router_feature_on_link').show();
    } else {
        $( '#div_celmodem_enabled_config').hide();
    }
}

function celmodem_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'celmodem');
}

function celmodem_config_show() {
    console.log("entrou celmodem_config_show " + JSON.stringify(config_to_save['cel_modem'], null, 4));
    block_other_acctions();
    celmodem_prepare_html();
    // limpar as divs que apresentam os dados
    var already_open = tags_configurar_show( 'celmodem', div_config_celmodem);
    if ( ! already_open) {
        if ( ! ( 'cel_modem' in config_to_save)) {
            config_to_save['cel_modem'] = { 'abs_enabled' : '1', 'abs_apn':'auto','abs_username':'','abs_password':'','abs_radio_band':'511','dns':''};
        }
        console.log("entrou celmodem_config_show " + JSON.stringify(config_to_save['cel_modem'], null, 4));
        $('#celmodem_enable').val(config_to_save['cel_modem']['abs_enabled']);
        $('#celmodem_dns_server').val(config_to_save['cel_modem']['dns']);
        $('#celmodem_anp').val(config_to_save['cel_modem']['abs_apn']);
        $('#celmodem_loginname').val(config_to_save['cel_modem']['abs_username']);
        $('#celmodem_password').val(config_to_save['cel_modem']['abs_password']);
        $('#celmodem_radionband').val(config_to_save['cel_modem']['abs_radio_band']);
        if (special_configs['router_feature_on_link']) {
            $('#celmodem_route_eth_cel').val( ! config_to_save['router']['wan_wanCel'] ? "0" : config_to_save['router']['wan_wanCel']);
            $('#celmodem_route_cel_eth').val( ! config_to_save['router']['wanCel_wan'] ? "0" : config_to_save['router']['wanCel_wan']);
        }
        celmodem_set_view();
    }
}

function celmodem_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'cel_modem' in config_to_save)) {
        config_to_save['cel_modem'] = {};
    }
    config_to_save['cel_modem']['abs_enabled'] = $('#celmodem_enable').val();
    config_to_save['cel_modem']['dns'] = $('#celmodem_dns_server').val();
    config_to_save['cel_modem']['abs_apn'] = $('#celmodem_anp').val();
    config_to_save['cel_modem']['abs_username'] = $('#celmodem_loginname').val();
    config_to_save['cel_modem']['abs_password'] = $('#celmodem_password').val();
    config_to_save['cel_modem']['abs_radio_band'] = $('#celmodem_radionband').val();
    if (special_configs['router_feature_on_link']) {
        config_to_save['router']['wan_wanCel'] = $('#celmodem_route_eth_cel').val();
        config_to_save['router']['wanCel_wan'] = $('#celmodem_route_cel_eth').val();
        config_has_been_changed('router')
    }
    tags_configurar_close( 'celmodem');
    config_has_been_changed('cel_modem')
    set_conversor_config_show_changes_on_page();
}