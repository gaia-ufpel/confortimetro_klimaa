
var div_config_sroute = null;
var div_config_sroute_each = null;


get_html('config_sroute');
get_html('config_sroute_each');

function sroute_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_sroute == null) {
        div_config_sroute = $('#config_sroute_html').html();
        $('#config_sroute_html').remove();
    }
    if ( div_config_sroute_each == null) {
        div_config_sroute_each = $('#config_sroute_each_html').html();
        $('#config_sroute_each_html').remove();
    }
}

function sroute_set_view() {
}

function sroute_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'sroute');
}

function sroute_config_show() {
    console.log("entrou sroute_config_show");
    block_other_acctions();
    sroute_prepare_html();
    var already_open = tags_configurar_show( 'sroute', div_config_sroute);
    if ( ! already_open) {
        if ( ! ( 'static_routes' in config_to_save)) {
            config_to_save['static_routes'] = [];
        }
        var qtd = config_to_save['static_routes'].length;
        for ( var i = 0; i < qtd; i++) {
            sroute_add_new_route();
        }
        var idx = 0;
        var rule = null;
        $('#div_sroute_routes :input').each( function( e) {
            if ( this.id == 'sroute_description') {
                rule = config_to_save['static_routes'][idx++];
                console.log("config_to_save['static_routes'][i] " + JSON.stringify(rule) + '    indice ' + (idx - 1));
                $(this).val(rule['descr']);
            } else if ( rule != null) {
                if ( this.id == 'sroute_ip_version') {
                    $(this).val(rule['IPver']);
                }else if ( this.id == 'sroute_enabled') {
                    $(this).val(rule['enabled']);
                }else if ( this.id == 'sroute_dest_interface') {
                    $(this).val(rule['interface']);
                }else if ( this.id == 'sroute_target_network') {
                    $(this).val(rule['target']);
                }else if ( this.id == 'sroute_gateway_ip') {
                    $(this).val(rule['gateway']);
                }
            }
        });
        sroute_set_view();
    }
}

function sroute_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    config_to_save['static_routes'] = [];
    var sta = '';
    var newrule = null;
    $('#div_sroute_routes :input').each( function( e) {
        if ( this.id == 'sroute_description') {
            if ( newrule != null && Object.keys(newrule).length > 2) {
                config_to_save['static_routes'].push(newrule);
            }
            newrule = {};
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['descr'] = sta;
            }
        } else if ( this.id == 'sroute_ip_version') {
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['IPver'] = sta;
            }
        } else if ( this.id == 'sroute_enabled') {
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['enabled'] = sta;
            }
        } else if ( this.id == 'sroute_dest_interface') {
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['interface'] = sta;
            }
        } else if ( this.id == 'sroute_target_network') {
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['target'] = sta;
            }
        } else if ( this.id == 'sroute_gateway_ip') {
            sta = $(this).val();
            if ( sta != null && sta.length > 0) {
                newrule['gateway'] = sta;
            }
        }
    });
    // Para adicionar a ultima regra que cai fora do each
    if ( newrule != null && Object.keys(newrule).length > 2) {
        config_to_save['static_routes'].push(newrule);
    }
    tags_configurar_close('sroute');
    config_has_been_changed('static_routes')
    set_conversor_config_show_changes_on_page();
}

function sroute_add_new_route() {
    var stprefix = '_' + div_config_sroute_contador++ + '_';
    var newstr = div_config_sroute_each.replace('div_config_sroute', stprefix + 'div_config_sroute');
    newstr = newstr.replace('id_sroute_del', stprefix);
    $('#div_sroute_routes').append(newstr);
}

function prepare_routes(data) {
    return data;
}

function sroute_refresh() {
    /*  TODO  buscar as rotas atuais e mostrar na div div_sroute_current_routes
    */
   var div_target = 'div_sroute_current_routes';
    $('#' + div_target).empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'routes',
            "destination": 'get'
        }
    };
    __diagnostics_send( aux, div_target, prepare_routes);
}
