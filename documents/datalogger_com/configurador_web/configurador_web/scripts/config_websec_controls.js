
var div_config_websec = null;
var div_config_websec_contador = 0;

get_html('config_websec');

function websec_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_websec == null) {
        div_config_websec = $('#config_websec_html').html();
        $('#config_websec_html').remove();
    }
}

function websec_set_view() {
    // console.log("websec_set_view " + $('#websec_dhcp_conf').children("option:selected").val());
    if (special_configs['fw_multisrc_config_feature_available']){
        $('.div_fw_multisrc_config_feature_available').show();
    } else {
        $('.div_fw_multisrc_config_feature_available').hide();
    }
    if ($('#websec_change_password').children("option:selected").val() == '1') {
        $( '#websec_div_change_pwd').show();
    } else {
        $( '#websec_div_change_pwd').hide();
    }
    if ($('#websec_allow_on_wancel').children("option:selected").val() == '1' && special_configs['use_pro']) {
        $( '#websec_div_allowed_ips').show();
    } else {
        $( '#websec_div_allowed_ips').hide();
    }
    if ($('#websec_allow_on_lan').children("option:selected").val() == '1' && special_configs['use_pro']) {
        $( '#websec_div_allowed_lan_ips').show();
    } else {
        $( '#websec_div_allowed_lan_ips').hide();
    }
    if ($('#websec_allow_on_ovpn').children("option:selected").val() == '1' && special_configs['use_pro']) {
        $( '#websec_div_allowed_ovpn_ips').show();
    } else {
        $( '#websec_div_allowed_ovpn_ips').hide();
    }
    if ($('#websec_allow_on_ipsec').children("option:selected").val() == '1' && special_configs['use_pro']) {
        $( '#websec_div_allowed_ipsec_ips').show();
    } else {
        $( '#websec_div_allowed_ipsec_ips').hide();
    }
}

function websec_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'websec');
}

function websec_config_show() {
    console.log("entrou websec_config_show");
    block_other_acctions();
    websec_prepare_html();
    var already_open = tags_configurar_show( stwebsec, div_config_websec);
    if ( ! already_open) {
        if ( special_configs['celmodem_available']) {
            $('#div_websec_allow_on_wancel').show();
        } else {
            $('#div_websec_allow_on_wancel').hide();
        }
        console.log("WEBSEC  config " + JSON.stringify(config_to_save[stwebsec]));
        if ( ! ( stwebsec in config_to_save)) {
            console.log("Nao encontrou " + stwebsec + " na configuracao");
            config_to_save[stwebsec] = {
                "allow_http_on_wancel":"0",
                "allow_http_on_lan":"0",
                "allow_http_on_ovpn":"0",
                "allow_http_on_ipsec":"0",
                "force_authorize":"0",
            };
        }
        $('#websec_allow_on_wancel').val(config_to_save[stwebsec]['allow_http_on_wancel']);
        $('#websec_allow_on_lan').val(config_to_save[stwebsec]['allow_http_on_lan']);
        $('#websec_allow_on_ovpn').val(config_to_save[stwebsec]['allow_http_on_ovpn']);
        $('#websec_allow_on_ipsec').val(config_to_save[stwebsec]['allow_http_on_ipsec']);
        if ( ! ('allowed_ips' in config_to_save[stwebsec])) {
            config_to_save[stwebsec]['allowed_ips'] = [];
        }
        if ( ! ('allowed_ips_from_lan' in config_to_save[stwebsec])) {
            config_to_save[stwebsec]['allowed_ips_from_lan'] = [];
        }
        if ( ! ('allowed_ips_from_ovpn' in config_to_save[stwebsec])) {
            config_to_save[stwebsec]['allowed_ips_from_ovpn'] = [];
        }
        if ( ! ('allowed_ips_from_ipsec' in config_to_save[stwebsec])) {
            config_to_save[stwebsec]['allowed_ips_from_ipsec'] = [];
        }
        $('#id_websec_wancel_allowed_ips').val(fw_src_ips_array2text(config_to_save[stwebsec]['allowed_ips']));
        $('#id_websec_lan_allowed_ips').val(fw_src_ips_array2text(config_to_save[stwebsec]['allowed_ips_from_lan']));
        $('#id_websec_ovpn_allowed_ips').val(fw_src_ips_array2text(config_to_save[stwebsec]['allowed_ips_from_ovpn']));
        $('#id_websec_ipsec_allowed_ips').val(fw_src_ips_array2text(config_to_save[stwebsec]['allowed_ips_from_ipsec']));
        
        $('#websec_enforce_authorization').val(config_to_save[stwebsec]['force_authorize']);
        if( 'change_pwd' in config_to_save[stwebsec]) {
            $('#websec_change_password').val("1");
            $('#websec_current_pwd').val( config_to_save[stwebsec]['change_pwd']['current']);
            $('#websec_new_pwd').val( config_to_save[stwebsec]['change_pwd']['new']);
        } else {
            $('#websec_change_password').val("0");
        }
        websec_set_view();
    }
}

function websec_edit_confirm( event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( stwebsec in config_to_save)) {
        config_to_save[stwebsec] = {};
    }
    config_to_save[stwebsec]['allow_http_on_wancel'] = $('#websec_allow_on_wancel').val();
    config_to_save[stwebsec]['allow_http_on_lan'] = $('#websec_allow_on_lan').val();
    config_to_save[stwebsec]['allow_http_on_ovpn'] = $('#websec_allow_on_ovpn').val();
    config_to_save[stwebsec]['allow_http_on_ipsec'] = $('#websec_allow_on_ipsec').val();
    config_to_save[stwebsec]['allowed_ips'] = fw_src_ips_text2array($('#id_websec_wancel_allowed_ips').val());
    config_to_save[stwebsec]['allowed_ips_from_lan'] = fw_src_ips_text2array($('#id_websec_lan_allowed_ips').val());
    config_to_save[stwebsec]['allowed_ips_from_ovpn'] = fw_src_ips_text2array($('#id_websec_ovpn_allowed_ips').val());
    config_to_save[stwebsec]['allowed_ips_from_ipsec'] = fw_src_ips_text2array($('#id_websec_ipsec_allowed_ips').val());

    config_to_save[stwebsec]['force_authorize'] = $('#websec_enforce_authorization').val();

    if ($('#websec_change_password').children("option:selected").val() == '1') {
        config_to_save[stwebsec]['change_pwd'] = {}
        config_to_save[stwebsec]['change_pwd']['current'] = $('#websec_current_pwd').val();
        config_to_save[stwebsec]['change_pwd']['new'] = $('#websec_new_pwd').val();
    } else {
        if( 'change_pwd' in config_to_save[stwebsec]) {
            delete config_to_save[stwebsec]['change_pwd'];
        }
    }
    tags_configurar_close(stwebsec);
    config_has_been_changed(stwebsec)
    set_conversor_config_show_changes_on_page();
}
