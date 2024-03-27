
var div_config_ddns = null;
var ddns_providers_list = ['noip', 'dyndns'];
 
get_html('config_ddns');

function ddns_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ddns == null) {
        div_config_ddns = $('#config_ddns_html').html();
        $('#config_ddns_html').remove();
    }
}

function ddns_set_view() {
    for ( var idx in ddns_providers_list) {
        var staux = ddns_providers_list[idx];
        if ( $('#ddns_use_' + staux).is(':checked')) {
            $( '#div_ddns_enabled_config_' + staux).show();
        } else {
            $( '#div_ddns_enabled_config_' + staux).hide();
        }
    }
}

function ddns_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ddns');
}

function ddns_config_show() {
    console.log("entrou ddns_config_show " + JSON.stringify(config_to_save['ddns'], null, 4));
    block_other_acctions();
    ddns_prepare_html();
    // limpar as divs que apresentam os dados
    var already_open = tags_configurar_show( 'ddns', div_config_ddns);
    if ( ! already_open) {
        if ( ! ( 'ddns' in config_to_save)) {
            config_to_save['ddns'] = {};
        }
        console.log("entrou ddns_config_show " + JSON.stringify(config_to_save['ddns'], null, 4));
        for ( var idx in ddns_providers_list) {
            var staux = ddns_providers_list[idx];
            if ( staux in config_to_save['ddns'] ) {
                $('#ddns_use_' + staux).prop('checked', true);
                $('#ddns_hostname_' + staux).val(config_to_save['ddns'][staux]['myhostname']);
                $('#ddns_loginname_' + staux).val(config_to_save['ddns'][staux]['username']);
                $('#ddns_password_' + staux).val(config_to_save['ddns'][staux]['password']);
            } else {
                $('#div_ddns_enabled_config_' + staux).prop('checked', false);
            }
        }
        ddns_set_view();
    }
}

function ddns_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'ddns' in config_to_save)) {
        config_to_save['ddns'] = {};
    }
    for ( var idx in ddns_providers_list) {
        var staux = ddns_providers_list[idx];
        if ($('#ddns_use_' + staux).is(':checked')) {
            if ( ! ( staux in config_to_save['ddns'])) {
                config_to_save['ddns'][staux] = {};
            }
            config_to_save['ddns'][staux]['myhostname'] = $('#ddns_hostname_' + staux).val();
            config_to_save['ddns'][staux]['username'] = $('#ddns_loginname_' + staux).val();
            config_to_save['ddns'][staux]['password'] = $('#ddns_password_' + staux).val();
        } else {
            delete (config_to_save['ddns'])[staux];
        }
    }
    tags_configurar_close( 'ddns');
    config_has_been_changed('ddns')
    set_conversor_config_show_changes_on_page();
}