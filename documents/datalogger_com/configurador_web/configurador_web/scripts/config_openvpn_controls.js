
var div_config_openvpn = null;

get_html('config_openvpn');

function openvpn_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_openvpn == null) {
        div_config_openvpn = $('#config_openvpn_html').html();
        $('#config_openvpn_html').remove();
    }
}

function openvpn_set_view() {
    if (special_configs['router_feature_on_link'])         $( '#div_openvpn_router_feature_on_link').show();
}

function openvpn_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'openvpn');
}

function openvpn_config_show() {
    console.log("entrou openvpn_config_show");
    block_other_acctions();
    openvpn_prepare_html();
    var already_open = tags_configurar_show( stovpn, div_config_openvpn);
    if ( ! already_open) {
        var ses = config_to_save[stovpn];
        var sdhcp = ses[stdhcpserver];
        $('#openvpn_use').val(ses['enabled']);
        $('#openvpn_dns_conf').val(ses['dns_from_vpn']);
        $('#openvpn_auto_login').val(ses['auto_login']);
        $('#openvpn_username').val(ses['username']);
        $('#openvpn_password').val(ses['password']);
        $('#openvpn_config_file').val(ses['config']);
        if (special_configs['router_feature_on_link']) {
            $('#openvpn_route_eth_ovpn').val( ! config_to_save['router']['wan_ovpn'] ? "0" : config_to_save['router']['wan_ovpn']);
            $('#openvpn_route_ovpn_eth').val( ! config_to_save['router']['ovpn_wan'] ? "0" : config_to_save['router']['ovpn_wan']);
        }
        openvpn_set_view();
    }
}

function openvpn_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( stovpn in config_to_save)) {
        config_to_save[stovpn] = {};
    }
    config_to_save[stovpn]['enabled'] = $('#openvpn_use').val();
    config_to_save[stovpn]['dns_from_vpn'] = $('#openvpn_dns_conf').val();
    config_to_save[stovpn]['auto_login'] = $('#openvpn_auto_login').val();
    config_to_save[stovpn]['username'] = $('#openvpn_username').val();
    config_to_save[stovpn]['password'] = $('#openvpn_password').val();
    config_to_save[stovpn]['config'] = $('#openvpn_config_file').val();
    if (special_configs['router_feature_on_link']) {
        config_to_save['router']['wan_ovpn'] = $('#openvpn_route_eth_ovpn').val();
        config_to_save['router']['ovpn_wan'] = $('#openvpn_route_ovpn_eth').val();
    }
    tags_configurar_close( 'openvpn');
    config_has_been_changed(stovpn)
    set_conversor_config_show_changes_on_page();
}