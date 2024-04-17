
var div_config_ipsec = null;
var div_config_ipsec_each = null;

get_html('config_ipsec');
get_html('config_ipsec_each');

function ipsec_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ipsec == null) {
        div_config_ipsec = $('#config_ipsec_html').html();
        $('#config_ipsec_html').remove();
    }
    if ( div_config_ipsec_each == null) {
        div_config_ipsec_each = $('#config_ipsec_each_html').html();
        $('#config_ipsec_each_html').remove();
    }
}

function ipsec_set_view() {
}

function ipsec_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ipsec');
}

function ipsec_config_show() {
    console.log("entrou ipsec_config_show");
    block_other_acctions();
    ipsec_prepare_html();
    var already_open = tags_configurar_show( stipsec, div_config_ipsec);
    if ( ! already_open) {
        if ( ! ( stipsec in config_to_save)) {
            config_to_save[stipsec] = {};
        }
        $('#ipsec_use').val(config_to_save[stipsec]['enabled']);
        $('#ipsec_conf_content').val(config_to_save[stipsec]['ipsec.conf']);
        $('#ipsec_secrets_content').val(config_to_save[stipsec]['ipsec.secrets']);

        var st = 'ipsec.d';
        if ( st in config_to_save[stipsec]) {
            var files = [];
            for ( var folder in config_to_save[stipsec][st]) {
                for (var fname in config_to_save[stipsec][st][folder]) {
                    var dados = config_to_save[stipsec][st][folder][fname];
                    var prex = '0';
                    var tipoarq = 'binary';
                    console.log(' preexistent ' + dados["preexistent"]);
                    if (dados["preexistent"] == undefined || dados["preexistent"] == '1')  prex = '1';
                    if (dados['conteudo'] != null && dados['conteudo'].length > 0) {
                        tipoarq = 'plain-text';
                    }
                    var newfile_cert = {
                        "folder":folder,
                        "name":fname,
                        "acao":dados["acao"],
                        "conteudo":dados["conteudo"],
                        "base64":dados["base64"],
                        "preexistent":prex,
                        'tipoarquivo':tipoarq
                    };
                    files.push(newfile_cert);
                }
            }
            var qtd = files.length;
            for ( var i = 0; i < qtd; i++) {
                ipsec_add_new_certificate();
            }
            qtd = 0;
            $('#div_ipsec_certificates :input').each( function( e) {
                if ( this.id.includes('id_ipsec_index_to_use')){
                    files[qtd++]['indice'] = $(this).val();
                }
            });
            var preex = false;
            console.log('Arquivos de certificados encontrados ' + JSON.stringify(files));
            var i = 0;
            for (i = 0; i < qtd; i++) {
                idx = files[i]['indice'];
                var preex = false;
                console.log('Dados deste registro ' + idx + '  ' + JSON.stringify(files[idx]));
                var id = '_' + idx;
                $('#id_ipsec_folder' + id).val( files[idx]["folder"]);
                $('#id_ipsec_certificate_file_preexistent' + id).val(files[idx]["preexistent"]);
                if (files[idx]["preexistent"] == '1' || files[idx]["preexistent"] == 1){
                    preex = true;
                }
                $('#id_ipsec_certificate_name' + id).val(files[idx]["name"]);
                if (files[idx]["acao"] == 'tira') {
                    $('#id_ipsec_delete_certificate_file' + id).prop('checked', true);
                }
                $('#id_ipsec_certificate_content' + id).val(files[idx]["conteudo"]);
                $('#id_ipsec_certificate_base64' + id).val(files[idx]["base64"]);
                $('#id_ipsec_cert_content_type' + id).val(files[idx]["tipoarquivo"]);
                ipsec_chage_visibility( 'id_ipsec_cert_content_type' + id)
                if (preex) {
                    console.log('Vai apagar o botao para remover esta entrada no config - ' + id + '_ipsec_del');
                    // Apagar o botao de del se for preex
                    $('#id_ipsec_del' + id).hide();
                    $('#id_ipsec_del' + id).prop('disabled', true);
                    $('.cls_ipsec_delete_certificate_file' + id).show();
                    $('#id_ipsec_certificate_name' + id).prop('disabled', true);
                }
            }
        }
        ipsec_set_view();
    }
}

function ipsec_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    config_to_save[stipsec] = {
        'enabled':'0',
        'ipsec.conf':'',
        'ipsec.secrets':'',
        'ipsec.d':{
            'cacerts':{},
            'aacerts':{},
            'acerts':{},
            'certs':{},
            'crls':{},
            'ocspcerts':{},
            'private':{},
            'reqs':{},
        }
    };
    config_to_save[stipsec]['enabled'] = $('#ipsec_use').val();
    config_to_save[stipsec]['ipsec.conf'] = $('#ipsec_conf_content').val();
    config_to_save[stipsec]['ipsec.secrets'] = $('#ipsec_secrets_content').val();;

    var files = [];
    var qtd = 0;
    $('#div_ipsec_certificates :input').each( function( e) {
        console.log('Preenchendo ' + this.id);
        if ( this.id.includes('id_ipsec_index_to_use')){
            files[qtd++] = $(this).val();
        }
    });
    var newfile = null;
    var foldername = null;
    var filename = null;
    for (var i = 0; i < qtd; i++) {
        idx = files[i];
        var id = '_' + idx;
        newfile = {};
        foldername = $('#id_ipsec_folder' + id).val();
        filename = $('#id_ipsec_certificate_name' + id).val();
        newfile['preexistent'] = $('#id_ipsec_certificate_file_preexistent' + id).val();
        if ($('#id_ipsec_delete_certificate_file' + id).is(":checked")) {
            newfile['acao'] = 'tira';
        } else {
            newfile['acao'] = 'poe';
        }
        var tipocont = $('#id_ipsec_cert_content_type' + id).val();
        if (tipocont == 'plain-text') {
            newfile['conteudo'] = $('#id_ipsec_certificate_content' + id).val();
        } else {
            newfile['base64'] = $('#id_ipsec_certificate_base64' + id).val();
        }
        
        config_to_save[stipsec]['ipsec.d'][foldername][filename] = newfile;
    }
    tags_configurar_close( 'ipsec');
    config_has_been_changed(stipsec)
    set_conversor_config_show_changes_on_page();
}

function ipsec_add_new_certificate() {
    var idx = div_config_ipsec_contador++;
    var stprefix = '_' + idx + '_';
    var newstr = div_config_ipsec_each.replace('div_config_ipsec', stprefix + 'div_config_ipsec');
    newstr = newstr.replace('id_ipsec_index_to_use', 'id_ipsec_index_to_use_' + stprefix);
    newstr = newstr.replace('id_ipsec_value_to_use', idx);
    newstr = newstr.replace(/_alteraid/g, '_' + idx);
    $('#div_ipsec_certificates').append(newstr);
    // Check for the File API support.
    document.getElementById('id_ipsec_cert_content_type_' + idx).addEventListener('change', ipsec_handle_file_type, false);
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('id_ipsec_certificate_file_' + idx).addEventListener('change', ipsec_handleFileSelect, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}



function ipsec_handleFileSelect(evt) {
    console.log('Estrutura do arquivo ' + JSON.stringify(evt.target.files[0]));
    var f = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    console.log('Taget id = ' + evt.target.id);
    var id = evt.target.id.substring('id_ipsec_certificate_file'.length);
    var stcunteudo = 'id_ipsec_certificate_base64' + id;
    var currname = document.getElementById('id_ipsec_certificate_name' + id).value
    var filename = evt.target.files[0].name;
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        var binaryData = e.target.result;
        //Converting Binary Data to base 64
        var base64String = window.btoa(binaryData);
        //showing file converted to base64
        document.getElementById(stcunteudo).value = base64String;
        if (currname == null || currname.length == 0) {
            document.getElementById('id_ipsec_certificate_name' + id).value = filename;
        }
      };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsBinaryString(f);
}

function ipsec_handle_file_type(evt) {
    ipsec_chage_visibility(evt.target.id);
}

function ipsec_chage_visibility(objid) {
    filetype = $('#' + objid).val();
    var id = objid.substring('id_ipsec_cert_content_type'.length)
    var sttiposhow = sttipohide = '';
    if (filetype == 'plain-text') {
        sttiposhow = 'plain';
        sttipohide = 'bin';
    } else {
        sttiposhow = 'bin';
        sttipohide = 'plain';
    }
    $('#id_ipsec_certificate_file_type_' + sttiposhow + id).show();
    $('#id_ipsec_certificate_file_type_' + sttipohide + id).hide();
}
