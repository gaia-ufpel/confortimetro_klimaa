        
var editor = null;
var editor_finnal_config = null;
var tags_configurar_controler = {};
var view_finnal_config = false;
var view_finnal_config_full = true;

function hide_status_message() {
    $( "#result_status" ).empty()
    $( "#load_result" ).empty().hide()
    $(".hide_status").hide()
};

function hide_configurar() {
    $("#div_configurar").hide()
    $("#load_result").empty().hide()
    $('.tags_configurar').hide();
};


function show_waiting() {
    $("#waiting").css("visibility", "visible");
}

function hide_waiting() {
    $("#waiting").css("visibility", "hidden");
}

function hide_config_save_pending() {
    if ( special_configs['show_raw_config_json'] ) {
        // Vamos manter esta area de edicao sempre visivel
        $('#config_save_pending').show();
        $("#config_save_pending").css("visibility", "visible");
    } else {
        $('#config_save_pending').hide();
    }
    if (config_save_pending) {
        $('#menu_item_save_pending').show();
        $("#id_save_pending").prop("disabled",false);
        $("#id_save_pending").removeClass("btn-outline-secondary");
        $("#id_save_pending").addClass("btn-outline-primary");
    } else {
        $('#menu_item_save_pending').hide();
        $("#id_save_pending").prop("disabled",true);
        $("#id_save_pending").removeClass("btn-outline-primary");
        $("#id_save_pending").addClass("btn-outline-secondary");
    }
}

function show_config_save_pending() {
    if (config_save_pending) {
        $('#menu_item_save_pending').show();
        $("#id_save_pending").prop("disabled",false);
        $("#id_save_pending").removeClass("btn-outline-secondary");
        $("#id_save_pending").addClass("btn-outline-primary");
    } else {
        $('#menu_item_save_pending').hide();
        $("#id_save_pending").prop("disabled",true);
        $("#id_save_pending").removeClass("btn-outline-primary");
        $("#id_save_pending").addClass("btn-outline-secondary");
    }
    if ( special_configs['show_raw_config_json'] ) {
        $('#config_save_pending').show();
        $("#config_save_pending").css("visibility", "visible");
    } else {
        $('#config_save_pending').hide();
        menu_show();
    }
}

function set_on_finnal_config_editor( values) {
    if ( values == null) {
        values = build_set_conversor_config_2_send();
    }
    config_save_pending = true;
    editor_finnal_config.setValue(JSON.stringify(values, null, 4));
    editor_finnal_config.refresh();
}

function http_error( request, status, error) {
    // quando o servidor responde mas nao consegue entregar o resultado
    if ( request.status > 99) {
        $( "#load_result" ).empty().append( "<h2>"+ lang.t("Fail: ") + lang.t(error) + "</h2>" ).show();
    } else {
        $( "#load_result" ).empty().append( "<h2>"+ lang.t("Fail: ") + lang.t("Check IP, hostname and network connection.") + "</h2>" ).show();
    }
    hide_waiting();

    console.log( "error ");
    console.log( request.status);
    console.log( status);
    console.log( error);
};

function block_other_acctions() {
    $('.can_block').prop('disabled', true);
    menu_hide();
}

function free_other_acctions() {
    $('.can_block').prop('disabled', false);
    menu_show();
}

function tags_configurar_show( witch, div_config) {
    console.log("tags_configurar_show entro para " + witch);
    var already_open = true;
    if ( ! ( witch in tags_configurar_controler)) {
        tags_configurar_controler[witch] = false;
    }
    $('.tags_configurar').hide();
    console.log("tags_configurar_show Ja aberto " + tags_configurar_controler[witch] + "  div a inserir " + div_config);
    if ( ! tags_configurar_controler[witch]) { // nao esta aberto, monta toda a div
        already_open = false;
        if ( div_config != null) {
            $('#div_configurar_' + witch).empty().append(div_config);            
        }
    }
    tags_configurar_controler[witch] = true;
    // se ele nao tinha sido fechado, apenas mostra
    $('#div_configurar_' + witch).show();
    console.log('already_open ' + already_open);
    return already_open;
}

function tags_configurar_close( witch) {
    tags_configurar_controler[witch] = false;
    $('#div_configurar_' + witch).hide();
    menu_show();
}

var menu_visible = false;
function menu_show() {
    if ( status_current != null && current_config_loaded) {
        menu_visible = true;
        console.log("Chamada da menu_show - vai mostrar");
        $("#menu_all_content").show();
    } else {
        menu_visible = false;
        console.log("Chamada da menu_show - vai apagar");
        $("#menu_all_content").hide();
    }
}

function menu_hide() {
    console.log("Chamada da menu_hide");
    menu_visible = false;
    // $("#divMenu").hide()
    $("#menu_all_content").hide();
}

function menu_set_view() {
    var staux = 'result_code';
    var showmenu = 0;
    // Conforme o tipo de pagina que entrou acertar a visibilidade 
    if ( special_configs['show_raw_config_json'] ) {
        $('#config_save_pending').show();
        $("#config_save_pending").css("visibility", "visible");
    } else {
        $('#config_save_pending').hide();
    }

    if ( status_current != null) {
        showmenu++;
        if (special_configs['celmodem_available']) {
            $('.config_celular').show();
        } else {
            $('.config_celular').hide();
        }
        if (special_configs['active_wd_available']) {
            $('.active_wd_available').show();
        } else {
            console.log('Nao eh para mostrar o item do active wd');
            $('.active_wd_available').hide();
        }
    }
    if ( special_configs['show_raw_config_json'] )                      $('#menu_item_show_config_on_editor').show();
    else                                                                $('#menu_item_show_config_on_editor').hide();
    if (special_configs['show_not_in_raw'])                             $('.not_in_raw').show();
    else                                                                $('.not_in_raw').hide();
    if (special_configs['router_feature_available'])                    $('#menu_item_router_config').show();
    else                                                                $('#menu_item_router_config').hide();
    if (special_configs['websec_feature_available'])                    $('#menu_item_web_security').show();
    else                                                                $('#menu_item_web_security').hide();
    if (special_configs['dhcp_exclusive_config'])                       $( '#menu_item_dhcp_config_display').show();
    else                                                                $( '#menu_item_dhcp_config_display').hide();
    if (special_configs['change_config_ip_feature_available'])          $( '#menu_item_change_config_ip').show();
    else                                                                $( '#menu_item_change_config_ip').hide();
    if (special_configs['scheduled_reboot_feature_available'])          $( '#menu_item_scheduled_reboot').show();
    else                                                                $( '#menu_item_scheduled_reboot').hide();
    if (special_configs['dmz_config_feature_available'])                $( '#menu_item_dmz_config_display').show();
    else                                                                $( '#menu_item_dmz_config_display').hide();
    if (special_configs['static_routes_feature_available'])             $( '#menu_item_static_routes_config_display').show();
    else                                                                $( '#menu_item_static_routes_config_display').hide();
    if (special_configs['ovpn_feature_available'])                      $( '.show_vpn_features').show();
    else                                                                $( '.show_vpn_features').hide();
    if (special_configs['ipsec_feature_available'])                     $( '.show_vpn_ipsec_features').show();
    else                                                                $( '.show_vpn_ipsec_features').hide();
    if (special_configs['network_features_available'])                  $( '#div_show_network_features').show();
    else                                                                $( '#div_show_network_features').hide();
    if (special_configs['userapp_feature_available'])                   $( '.show_userapp_features').show();
    else                                                                $( '.show_userapp_features').hide();
    if (special_configs['use_pro']) {
        $( '.show_conflict_solving').show();
        $( '#websec_div_allowed_lan_ips').show();
        $( '#websec_div_allowed_ips').show();
        $( '#websec_div_allowed_ovpn_ips').show();
        $( '#websec_div_allowed_ipsec_ips').show();
        $( '#menu_item_celular_features_at_command').show();
    } else {
        $( '.show_conflict_solving').hide();
        $( '#websec_div_allowed_lan_ips').hide();
        $( '#websec_div_allowed_ips').hide();
        $( '#websec_div_allowed_ovpn_ips').hide();
        $( '#websec_div_allowed_ipsec_ips').hide();
        $( '#menu_item_celular_features_at_command').hide();
    }
    if ( current_config_loaded) {
        showmenu++;
    }
    if ( showmenu > 1) {
        $('#menu_all_content').show();
    } else {
        $('#menu_all_content').hide();
    }
}
