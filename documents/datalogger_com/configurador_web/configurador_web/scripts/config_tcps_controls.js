
var tcp_client_add_host_and_port_incremental = 0;
var div_config_tcp = null
var div_config_tcp_each = null
var tcp_config_em_edicao = null;
var tcp_all_configured = null;


get_html('config_tcps');
get_html('config_tcps_each');

function tcp_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_tcp == null) {
        div_config_tcp = $('#config_tcps_html').html();
        $('#config_tcps_html').remove();
    }
    if ( div_config_tcp_each == null) {
        div_config_tcp_each = $('#config_tcps_each_html').html();
        console.log("tcp_prepare_html div_config_tcp_each " + div_config_tcp_each);
        $('#config_tcps_each_html').remove();
    }
}

function tcp_config_reset_tcp_all_configured() {
    tcp_all_configured = { 
        "to_outside" : {
            "00" : null,
            "01" : null,
            "02" : null,
            "03" : null,
            "04" : null,
            "05" : null,
            "06" : null,
            "07" : null,
            "08" : null,
            "09" : null,
        }, 
        "to_inside" : {
            // Inicia do 1 porque o canal 0 eh para as seriais
            "01" : null,
            "02" : null,
            "03" : null,
            "04" : null,
            "05" : null,
            "06" : null,
            "07" : null,
            "08" : null,
            "09" : null,
        }
    };
}
// Faz a chamada para entrar ja resetado
tcp_config_reset_tcp_all_configured();

function tcp_client_add_host_and_port( e, div_id, obj) {
    var div = $('div[id^=' + div_id + ']');
    var div2clone = div[0];
    console.log("Numero de divs " + div.length + " para clonar a div " + div_id);
    console.log("As divs " , div2clone );
    var newdiv = $(div2clone).clone(true, true).prop('id', div_id + ++tcp_client_add_host_and_port_incremental );
    $(div2clone).after( newdiv);

}

function tcp_client_del_host_and_port( e, div_id, obj) {
    var div = $('div[id^=' + div_id + ']');
    // var div2del = $(this).closest('div');
    var div2del = $(obj).closest('div');
    console.log("Delete div  " + div_id);
    console.log("this ", this);
    console.log("Botao de delete ", div2del);
    console.log("Botao de delete ", div2del.attr('id'));
    console.log("Numero de divs " + div.length);
    if (div.length > 1 ) {
        div2del.remove();
    }
}

function tcp_config_show() {
    console.log("entrou tcp config show");
    tcp_prepare_html();
    // limpar as divs que apresentam os dados
    var already_open = tags_configurar_show( 'tcps', div_config_tcp);
    $('#div_tcp_outside_list').empty();
    $('#div_tcp_inside_list').empty();
    // percorrer o tcp_all_configured e aplicar cada uma nas divs corretas
    for ( var toside in tcp_all_configured) {
        console.log("tcp_config_show varrendo tcp's para " + toside);
        for ( var name in tcp_all_configured[toside]) {
            console.log("tcp_config_show pegou a tcp  " + name);
            var values = tcp_all_configured[toside][name];
            if ( values != null) {
                console.log("tcp_config_show tem valores para mostrar " + name);
                tcp_config_present_one( toside, name, values, true);
            }
        }
    }
    $(".show_config_abs_mux").hide();
    $(".show_config_tcp_serial").hide();
    $(".show_config_" + special_configs['tcp_config_type']).show();
    tcp_edit_cancel();
}

function __tcp_config_get_empty_slot( toside) {
    var res = null;
    for ( var idx in tcp_all_configured[toside])  {
        // console.log("idx " + idx);
        var values = tcp_all_configured[toside][idx];
        if ( values == null) {
            res = {
                "toside": toside,
                "name": idx,
                "values" : values
            }
            break;
        }
    }
    return res;
}

function __tcp_config_build_pref_from_id( btn_id) {
    var p = btn_id.split("_");
    var toside = p[0] + "_" + p[1];
    var name = p[2];
    console.log("__tcp_config_build_pref_from_id btn_id " + btn_id + " toside " + toside + "  name " + name);
    return __tcp_config_build_pref( toside, name);
}

function __tcp_config_build_pref( toside, name) {
    var pref = toside + "_" + name + "_";
    var predivid = "div_config_tcp";
    var divid = pref + predivid;
    var ret = {
        'pref' : pref,
        'name':name,
        'toside':toside,
        'div' : predivid,
        'div_id': divid,
        'container': 'container_' + divid
    };
    return ret;
}

function __tcp_config_tunn_toside( pref, toside, name, values) {

    console.log("__tcp_config_tunn_toside  pref " + pref + " toside " + toside + " name " + name);
    if ( toside == sttoinside) {
        $('#' + pref + 'tcp_config_id_label').show();
        $('#' + pref + 'tcp_config_outside_label').hide();
        $('#' + pref + 'tcp_server_allowed_on_cel_modem').prop('disabled', true);
        $('#' + pref + 'tcp_server_allowed_on_lan').val('1');
        $('#' + pref + 'tcp_server_allowed_on_lan').prop('disabled', false);
        $('#' + pref + 'tcp_server_allowed_on_ovpn').prop('disabled', true);
        $('#' + pref + 'tcp_server_allowed_on_ipsec').prop('disabled', true);
        $('#' + pref + "tcp_client_hosttype option[value='0']").remove();
        $('#' + pref + "tcp_client_hosttype option[value='1']").remove();
        $('#' + pref + "tcp_client_hosttype").val(2);
        $('#' + pref + 'div_tcp_server_modbus_tcp').hide();
        $('#' + pref + 'div_tcp_client_modbus_tcp').hide();
        $('#' + pref + 'div_config_tcp_local_tira').hide();
        $('#' + pref + 'tcp_client_del_host_and_port_id').hide();
    } else {
        $('#' + pref + 'div_tcp_server_modbus_tcp').show();
        $('#' + pref + 'div_tcp_client_modbus_tcp').show();
        $('#' + pref + 'tcp_config_id_label').hide();
        $('#' + pref + 'tcp_config_outside_label').show();
        // preenche o campo de conectado a para outside
        if ( ! special_configs['two_serial_ports']) {
            $('<option/>').val('serials').html(lang.t('Serial ports')).appendTo('#' + pref + 'tcp_client_connected_to');
        } else {
            $('<option/>').val('serial_publica').html(lang.t('Serial 1')).appendTo('#' + pref + 'tcp_client_connected_to');
            $('<option/>').val('serial_abs').html(lang.t('Serial 2')).appendTo('#' + pref + 'tcp_client_connected_to');
        }
        for ( var name in tcp_all_configured[sttoinside]) {
            if ( tcp_all_configured[sttoinside][name] != null) {
                $('<option/>').val(name).html('Local' + ' ' + name).appendTo('#' + pref + 'tcp_client_connected_to');
            }
        }
        // agora selecionar os que estao marcados
        if ( values != null && stlkto in values && values[stlkto].length > 0) {
            console.log("Tunning para mostrar " + JSON.stringify( values, null, 4));
            for ( idx in values[stlkto]) {
                var lkto = values[stlkto][idx];
                console.log("Esta linked to " + lkto)
                if ( lkto in tcp_all_configured[sttoinside] || lkto == 'serials' || lkto == 'serial_publica' || lkto == 'serial_abs') {
                    $('#' + pref + 'tcp_client_connected_to' + ' option[value=' + lkto + ']').attr('selected', true);
                }
            }
        }
    }
}

function new_tcp_to_outside() {
    var toside = sttooutside;
    var res = __tcp_config_get_empty_slot( toside);
    // buscar um slot livre para pegar o nome
    if ( res != null) {
        tcp_edit_mode_on(toside, res['name'], res['values']);
    }
}

function new_tcp_to_inside() {
    var toside = sttoinside;
    var res = __tcp_config_get_empty_slot( toside);
    // buscar um slot livre para pegar o nome
    if ( res != null) {
        tcp_edit_mode_on(toside, res['name'], res['values']);
    }
}

function tcp_edit_mode_on( toside, name, values) {
    var where = null;

    if ( values == null) {
        // eh novo elemento
        if ( toside == sttooutside) {
            where = "div_tcp_outside_list";
        } else {
            where = "div_tcp_inside_list";
        }
    } else {
        // eh elemento ja existente, editar um ja existente
        var pref = toside + "_" + name + "_";
        tcp_config_em_edicao = pref + "div_config_tcp";
        where = "container_" + tcp_config_em_edicao;
        $('#' + tcp_config_em_edicao).hide();
    }
    $("#" + where).append(div_config_tcp_each);
    $("#tcp_config_in_or_out").val(toside);
    $("#tcp_config_name").val(name);
    if ( values != null) {
        // Se vierem os valores temso que preencher a estrutura
        tcp_config_set_data_to_display( '', toside, name, values);
    }
    __tcp_config_tunn_toside( '', toside, name, values);
    $("#tcp_add_new_outside").prop('disabled', true);
    $("#tcp_add_new_inside").prop('disabled', true);
    $("#tcp_add_new").prop('disabled', true);
    $('.tcp_config_edita_btn').prop('disabled', true);
    $('.tcp_config_remove_btn').prop('disabled', true);
    $("#tcp_config_message").hide();
    $("#div_config_tcp").show();
}

function tcp_edit_cancel(){
    free_other_acctions();
    if ( tcp_config_em_edicao != null) {
        $('#' + tcp_config_em_edicao).show();
        tcp_config_em_edicao = null;
    }
    $("#div_config_tcp").remove();
    $("#tcp_add_new_outside").prop('disabled', false);
    $("#tcp_add_new_inside").prop('disabled', false);
    $("#tcp_add_new").prop('disabled', false);
    $('.tcp_config_edita_btn').prop('disabled', false);
    $('.tcp_config_remove_btn').prop('disabled', false);
}

function tcp_edit_get_data() {
    var ret = {"result" : 0, "msg" : "", "toside": null, "name" : null, "tcp_conection" : {}};
    var t = {};

    console.log(" Cliente ou server " + $("#config_tcp_client_server").val());
    ret["toside"] = $("#tcp_config_in_or_out").val();
    ret["name"] = $("#tcp_config_name").val();

    if ( ret["toside"] == sttooutside) {
        var selected_inside = [];
        $.each($("#tcp_client_connected_to option:selected"), function(){            
            console.log(" Os selecionados " + $(this).val());
            selected_inside.push($(this).val());
        });
        if ( selected_inside.length > 0) {
            t["linked_to"] = selected_inside;
        }
        if (t["linked_to"] == undefined || t["linked_to"].length == 0) {
            console.log("Nenhum Interno selecionado")
            ret["result"] = 1;
            ret["msg"] = "Please select at least one local connection";
            return ret;
        }
    }
    if ( $("#config_tcp_client_server").val() == 'server') {
        t['tipo'] = 'tcp_server';
        t['localport'] = $("#tcp_server_port").val();
        t['idletimeout'] = $("#tcp_server_idletimeout").val();
        t[stmodbustcp] = $("#tcp_server_modbus_tcp").val();
        t['allowed_on_cel_modem'] = $("#tcp_server_allowed_on_cel_modem").val();
        t['allowed_ips'] = fw_src_ips_text2array($("#id_tcp_server_allowed_on_cel_modem_ips").val());
        t['allowed_on_lan'] = $("#tcp_server_allowed_on_lan").val();
        t['allowed_ips_from_lan'] = fw_src_ips_text2array($("#id_tcp_server_allowed_on_lan_ips").val());
        t['allowed_on_ovpn'] = $("#tcp_server_allowed_on_ovpn").val();
        t['allowed_ips_from_ovpn'] = fw_src_ips_text2array($("#id_tcp_server_allowed_on_ovpn_ips").val());
        t['allowed_on_ipsec'] = $("#tcp_server_allowed_on_ipsec").val();
        t['allowed_ips_from_ipsec'] = fw_src_ips_text2array($("#id_tcp_server_allowed_on_ipsec_ips").val());
    } else {    // client
        t['tipo'] = 'tcp_client';
        t['hosttype'] = $("#tcp_client_hosttype").val();
        t['idletimeout'] = $("#tcp_client_idletimeout").val();
        t['login'] = $("#tcp_client_login").val();
        t['ns_hexa'] = $("#tcp_client_nshexa").val();
        t[stmodbustcp] = $("#tcp_client_modbus_tcp").val();
        t['hostname_and_port'] = [];
        var host_port = null;
        $('#div_config_tcp_client :input').each( function( e) {
            console.log(" Elemento na lista " + this.id + "  " + $(this).val());
            if ( this.id == "tcp_client_hostname") {
                host_port = $(this).val() + ":";
            } else if ( this.id == "tcp_client_port") {
                host_port += $(this).val();
                t['hostname_and_port'].push( host_port);
                host_port = null;
            }
        });
    }
    console.log("TCP resultado da edicao " + JSON.stringify( t, null, 4));
    ret["tcp_conection"] = t;
    return ret;
}

function tcp_config_set_data_to_display( pref, toside, name, t) {
    console.log("#######  tcp_config_set_data_to_display pref " + pref + " toside " + toside + " name " + name);
    console.log("tcp_config_set_data_to_display dados que serao colocados " + JSON.stringify( t, null, 4));
    $("#" + pref + "tcp_config_in_or_out").val(toside);
    $("#" + pref + "tcp_config_name").val(name);
    if ( t['tipo'] == 'tcp_server' ) {
        $("#" + pref + "config_tcp_client_server").val('server');
        $("#" + pref + "tcp_server_port").val(t['localport']);
        $("#" + pref + "tcp_server_idletimeout").val(t['idletimeout']);
        $("#" + pref + "tcp_server_modbus_tcp").val(t[stmodbustcp]);
        $("#" + pref + "tcp_server_allowed_on_cel_modem").val(t['allowed_on_cel_modem']);
        $("#" + pref + "id_tcp_server_allowed_on_cel_modem_ips").val(fw_src_ips_array2text(t['allowed_ips']));
        if ( $("#" + pref + "tcp_server_allowed_on_cel_modem").val() != 0) {
            $( '#' + pref + 'div_tcp_server_allowed_on_cel_modem').show();
        }
        $("#" + pref + "tcp_server_allowed_on_lan").val(t['allowed_on_lan']);
        $("#" + pref + "id_tcp_server_allowed_on_lan_ips").val(fw_src_ips_array2text(t['allowed_ips_from_lan']));
        if ( $("#" + pref + "tcp_server_allowed_on_lan").val() != 0) {
            $( '#' + pref + 'div_tcp_server_allowed_on_lan').show();
        }
        $("#" + pref + "tcp_server_allowed_on_ovpn").val(t['allowed_on_ovpn']);
        $("#" + pref + "id_tcp_server_allowed_on_ovpn_ips").val(fw_src_ips_array2text(t['allowed_ips_from_ovpn']));
        if ( $("#" + pref + "tcp_server_allowed_on_ovpn").val() != 0) {
            $( '#' + pref + 'div_tcp_server_allowed_on_ovpn').show();
        }
        $("#" + pref + "tcp_server_allowed_on_ipsec").val(t['allowed_on_ipsec']);
        $("#" + pref + "id_tcp_server_allowed_on_ipsec_ips").val(fw_src_ips_array2text(t['allowed_ips_from_ipsec']));
        if ( $("#" + pref + "tcp_server_allowed_on_ipsec").val() != 0) {
            $( '#' + pref + 'div_tcp_server_allowed_on_ipsec').show();
        }

        $( "#" + pref + "div_config_tcp_client").hide();
        $( "#" + pref + "div_config_tcp_server").show();
        if (special_configs['fw_multisrc_config_feature_available']) {
            $(".div_fw_multisrc_config_feature_available").show();
        } else {
            $(".div_fw_multisrc_config_feature_available").hide();
        }
    } else {    // client
        $("#" + pref + "config_tcp_client_server").val('client');
        $("#" + pref + "tcp_client_hosttype").val(t['hosttype']);
        $("#" + pref + "tcp_client_idletimeout").val(t['idletimeout']);
        $("#" + pref + "tcp_client_login").val(t['login']);
        $("#" + pref + "tcp_client_nshexa").val(t['ns_hexa']);
        $("#" + pref + "tcp_client_modbus_tcp").val(t[stmodbustcp]);
        console.log("tcp_config_set_data_to_display tcp_client modbustcp " + t[stmodbustcp]);
        var num = t['hostname_and_port'].length;
        // Clonar o numero de entradas necessarias, num - 1
        for( var i = 1; i < num; i++) {
            tcp_client_add_host_and_port( null, pref + "div_tcp_client_host_and_port", null);
        }
        var i = 0;
        var host_port = null;
        var partes;
        $("#" + pref + "div_config_tcp_client :input").each( function( e) {
            // console.log("input id " + this.id);
            if ( this.id == pref + "tcp_client_hostname") {
                host_port = t['hostname_and_port'][i++];
                console.log(" Host e port a ser colocado " + host_port);
                partes = host_port.split(":");
                $(this).val( partes[0]);
            } else if ( this.id == pref + "tcp_client_port") {
                $(this).val( partes[1]);
            }
        });
       $( "#" + pref + "div_config_tcp_client").show();
       $( "#" + pref + "div_config_tcp_server").hide();
   }
}

function tcp_config_special_treatment() {
    if ( special_configs['show_tcp_modemid']) {
        $('.tcp_client_nshexa').show();
    } else {
        $('.tcp_client_nshexa').hide();
    }
}

function tcp_config_present_one( toside, name, values, forceinsertion) {
 
    var res = __tcp_config_build_pref( toside, name);
    var pref = res['pref'];
    var newid = res['div_id'];
    var container = res['container'];
    var newdiv = null;
    var where = null;
    var isnew = false;
    forceinsertion = forceinsertion || false;
    // pegar os valores vindos e setar no slot 
    console.log("tcp_config_present_one  toside " + toside + " name " + name);
    if ( tcp_all_configured[toside][name] != null) {
        isnew = false;
    } else {
        isnew = true;
    }
    if ( forceinsertion) {
        isnew = true;
    }
    tcp_all_configured[toside][name] = values;
    if ( isnew) {
        // eh conteudo novo
        newdiv = '<div id="' + container + '">' + div_config_tcp_each.replace( res['div'], newid) + '</div>';
        if ( toside == sttooutside) {
            where = "div_tcp_outside_list";
        } else {
            where = "div_tcp_inside_list";
        }
    } else {
        $('#' + container).empty();
        where = container;
        newdiv = div_config_tcp_each.replace( res['div'], newid);
    }
    $("#" + where).append(newdiv);
    $("#" + newid + " *").each( function( e) {
        if ( this.id != null && this.id != "") {
            // console.log("tcp_config_present_one  id " + this.id);
            this.id = pref + this.id;
            $(this).prop('disabled', true);
        }
    });
    tcp_config_set_data_to_display( pref, toside, name, values);
    __tcp_config_tunn_toside( pref, toside, name, values);

    $('#' + pref + 'tcp_config_confirma').hide();
    $('#' + pref + 'tcp_config_cancel').hide();
    $('#' + pref + 'tcp_config_edita').show().prop('disabled', false);
    $('#' + pref + 'tcp_config_remove').show().prop('disabled', false);
    tcp_config_special_treatment();
    $("#" + newid).show();
}

function tcp_config_remove_one( btn_id) {
    var res = __tcp_config_build_pref_from_id( btn_id);
    tcp_all_configured[ res['toside']][res['name']] = null;
    $('#' + 'container_' + res['pref'] + 'div_config_tcp').remove();
}

function tcp_config_edit_one( btn_id) {
    var res = __tcp_config_build_pref_from_id( btn_id);
    block_other_acctions();
    tcp_edit_mode_on( res['toside'], res['name'], tcp_all_configured[ res['toside']][res['name']]);
    tcp_config_special_treatment();
}
