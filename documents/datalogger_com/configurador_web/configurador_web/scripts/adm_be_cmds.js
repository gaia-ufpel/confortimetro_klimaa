
var target_config = {
    type : 'modem',
    host_ip_device : "10.20.40.1",
    host_ip_absgateway : 'grps.absltda.com.br',
    port_absgateway : 5901,
    comport : null,
    comport_availabel : null,
    bauderate : 9600,
    cs : 8,
    parity : 'none',
    stopbit : 1
};
var host_ip_device_default = "10.20.40.1";  // hostname ou IP para chegar ao equipamento a ser configurado
var loginname = null;
var loginpassword = null;
var loginretry = null;

var __count_call_backend = 0
function __dec_count_call_backend() {
    if ( __count_call_backend > 0)  {
        __count_call_backend--;
    }
    if ( __count_call_backend < 1) {
        hide_waiting();
    }
}

function __call_backend( url_2_use, data, func_success, func_error) {
    console.log(" call_backend entrando com url " + url_2_use  + "  data " + data + "   __count_call_backend " + __count_call_backend);
    if ( __count_call_backend == 0) {
        show_waiting();
        hide_status_message();
    }
    var headers = {};
    var url = url_2_use;
    if ( target_config.type == 'modem') {
        if ( target_config.host_ip_device != null && target_config.host_ip_device.length > 0) {
            url = "http://" + target_config.host_ip_device + url_2_use;
        }
    } else if ( target_config.type == 'absgateway') {
        url = "http://" + 'localhost:4321' + url_2_use;
        headers['XX-ABS-Config'] = 'tcp ' + target_config.host_ip_absgateway + ' ' + target_config.port_absgateway;
    } else if ( target_config.type == 'serial') {
        url = "http://" + 'localhost:4321' + url_2_use;
        headers['XX-ABS-Config'] = 'com ' + target_config.comport + ' ' + target_config.bauderate + ' ' + target_config.cs + ' ' + target_config.parity + ' ' + target_config.stopbit;
    }
    $.ajax({
        dataType: "json",
        contentType: 'application/json',
        type: 'POST',
        url: url,
        timeout: 180000, // sets timeout to 180 seconds
        crossDomain: true,
        headers : headers,
        beforeSend: function (xhr) {
            if ( loginpassword !== null && loginpassword.length > 0) {
                console.log(' Vai colocar o header de autenticacao  name  ' + loginname + '  senha ' + loginpassword);
                xhr.setRequestHeader ("Authorization", "Basic " + btoa( loginname + ":" + loginpassword));
            }
        },
        data: data,
        success: function( data) {
            __dec_count_call_backend();
            if ( "result_code" in data && data.result_code >= 200 && data.result_code < 300) {
                if ( func_success != null) {
                    func_success(data);
                }
            } else {
                var result_msg = "";
                var excecution_msg = "";
                if ( "result_mesg" in data ) {
                    result_msg = data["result_mesg"];
                }
                if ( "data" in data) {
                    if ("firewall_restart" in data["data"]) {
                        excecution_msg = data["data"]["firewall_restart"];
                    } else if ("userapp_install" in data["data"]) {
                        excecution_msg = data["data"]["userapp_install"];
                    }
                }
                $( "#load_result" ).empty().append( "<h2>" + "Equipment return some error:" + "</h2><pre>" + JSON.stringify(data, null, 4) + "\n" + result_msg + "</pre> </br><pre>" + excecution_msg + "</pre></br>" ).show();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(" call_backend erro  status " + xhr.status + "  url " + url_2_use  + "  data " + data);
            
            if ( xhr.status != 401) {
                if ( __count_call_backend < 1) {
                    url_2_use = "/cgi-bin/conversor_server_config.py"
                    __count_call_backend++;
                    __call_backend( url_2_use, data, func_success, func_error);
                } else {
                    __dec_count_call_backend();
                    if ( func_error != null) {
                        func_error( xhr, ajaxOptions, thrownError);
                    }
                }
            } else {
                // mostrar a tela de login
                __dec_count_call_backend();
                $('.tags_configurar').hide();
                $('#div_login').show();
                loginretry = {
                    'url' : url_2_use,
                    'data': data,
                    'func_success':func_success,
                    'func_error':func_error
                }
            }
        }
    });
}

function do_reboot_or_default_config( do_what) {
    var url_2_use = "/cgi-bin/conversor_server_config.pyc";
    var dados_2_send = "";
    if ( do_what == "reboot") {
        dados_2_send = '{"cmd":"conversor_config","parms":{"command": "reboot","data": {}}}';
    } else {
        dados_2_send = '{"cmd" : "conversor_config","parms": {"command" : "reset_to_default"}}';
    }
    __call_backend( url_2_use, dados_2_send, function( data) {
        $("#reboot_waiting").show();
        var result_msg = "";
        if ( "result_mesg" in data ) {
            result_msg = data["result_mesg"];
        }
        menu_hide();
        $( "#load_result" ).empty().append( "<h2>" + lang.t("Result:") + "</h2><pre>" + JSON.stringify(data, null, 4) + "\n" + result_msg + "</pre> </br> " ).show();
    });
}


function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

function buildUri( p) {
    var ret = "";

    var sta = 'protocol';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += p[sta] + "://";
    }
    sta = 'userInfo';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += p[sta] + "@";
    } else {
        sta = 'user';
        if ( p[sta] != null && p[sta].length > 0) {
            ret += p[sta] + ":" + p['password'] + "#";
        }    
    }
    sta = 'host';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += p[sta];
    }
    sta = 'port';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += ":" + p[sta];
    }
    sta = 'path';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += p[sta];
    }
    sta = 'query';
    if ( p[sta] != null && p[sta].length > 0) {
        ret += "?" + p[sta];
    }
    // console.log("buildUri recebeu : " + JSON.stringify( p, null, 4) + "\n\n" + ret);
    return ret;
}

function get_html( name, callback ) {
    if ( $(location).attr('protocol') != 'file:') {
        $.get("scripts/" + name + ".html" , function (value) {
            $('#div_store_html_loaded').append('<div id="' + name + '_html" hidden="hidden">' + value + '</div>');
            console.log('Buscou o pedaco do html ' + name + '.html');
            if ( callback != null) {
                callback();
            }
        });
    }
}

function login_confirm() {
    loginname = $('#login_username').val();
    loginpassword = $('#login_password').val();
    console.log('Entrou na login confirm com loginname ' + loginname + '  poass ' + loginpassword + '  ' + JSON.stringify(loginretry));
    $('#login_fail').empty();
    __call_backend( loginretry.url, loginretry.data, loginretry.func_success, loginretry.func_error);
}
