/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {

    db: null,

    debug: true,

    info: function(value) {
        if (app.debug === true) {
            console.info(value);
        }
    },

    log: function(value) {
        if (app.debug === true) {
            console.log(value);
        }
    },

    value: {
        'tipo-despesa'      : null,
        'forma-pagamento'   : null,
        'conta'             : null,
        'valor'             : null
    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    getValue: function(key) {
        return app.value[key];
    },

    updateDatabaseToVersion: function(toVersion) {

        var updateDatabase = {

            '1.0' : function(tx) {

                tx.executeSql('DROP TABLE IF EXISTS contas');

                // See: http://sqlite.org/autoinc.html
                tx.executeSql('CREATE TABLE IF NOT EXISTS contas (' +
                    'id              INTEGER        NOT NULL PRIMARY KEY AUTOINCREMENT,' +
                    'tipo_despesa    VARCHAR(255),' +
                    'forma_pagamento VARCHAR(255),' +
                    'conta           VARCHAR(255),' +
                    'valor           VARCHAR(255),' +
                    'data            VARCHAR(255),' +
                    'sincronizado    BOOL'          +
                ')');

                app.info('Database updated to version 1.0!');

                updateDatabase['1.1'](tx);
            },
            '1.1': function(tx) {

                tx.executeSql('DROP TABLE IF EXISTS contas');

                // See: http://sqlite.org/autoinc.html
                tx.executeSql('CREATE TABLE IF NOT EXISTS contas (' +
                    'ROWID           INTEGER        PRIMARY KEY AUTOINCREMENT,' +
                    'tipo_despesa    VARCHAR(255)   NOT NULL,' +
                    'forma_pagamento VARCHAR(255)   NOT NULL,' +
                    'conta           VARCHAR(255),'            +
                    'valor           VARCHAR(255)   NOT NULL,' +
                    'data            VARCHAR(255)   NOT NULL,' +
                    'sincronizado    BOOL           NOT NULL'  +
                ')');

                app.info('Database updated to version 1.1!');
            }
        }

        app.db.transaction(updateDatabase[toVersion], app.errorCB, app.successCB);
    },

    inserirConta: function(tx) {

        var date = new Date();

        var dateTime = moment(date).format('YYYY-MM-DD HH:mm:ss');

        app.info(dateTime);

        var sql = 'INSERT INTO contas (tipo_despesa, forma_pagamento, conta, valor, data, sincronizado) VALUES (';

        sql += '"' + app.value['tipo-despesa']      + '", ';
        sql += '"' + app.value['forma-pagamento']   + '", ';

        if (app.value['conta'] != null) {
            sql += '"' + app.value['conta']         + '", ';
        } else {
            sql += 'null, ';
        }

        sql += '"' + app.value['valor']             + '", ';
        sql += '"' + dateTime                       + '", ';
        sql += '0';

        sql += ')';

        app.log(sql);

        tx.executeSql(sql);
    },

    renderGrid: function(tx) {

        var sql = 'SELECT * FROM contas ORDER BY data DESC';

        app.log(sql);

        tx.executeSql(sql, [], function(tx, results) {

            app.log('Foram encontrados ' + results.rows.length + ' registro(s) na tabela contas.');

            var listview = $(document).find('#listar ul.listar');

            $(listview).empty();

            var result = [];

            for (var i = 0; i < results.rows.length; i++) {

                var row = results.rows.item(i);

                var momentDate = moment(row.data).format('YYYY-MM-DD');

                if (!result[momentDate]) {
                    result[momentDate] = [];
                }

                result[momentDate].push({
                    'tipo-despesa'      : row['tipo_despesa'],
                    'valor'             : row['valor'],
                    'forma-pagamento'   : row['forma_pagamento'],
                    'conta'             : row['conta'],
                    'hora'              : moment(row['data']).format('HH:mm:ss'),
                    'sincronizado'      : row['sincronizado'] == 0 ? 'Não' : 'Sim'
                });
            }

            for (var date in result) {

                var momentDate = moment(date);

                var liContainer = $('<li>').attr('data-role', 'list-divider').html(
                    momentDate.format('dddd').charAt(0).toUpperCase()   +
                    momentDate.format('dddd').slice(1)                  + ', ' +
                    momentDate.format('DD')     + ' de ' +
                    momentDate.format('MMMM')   + ' de ' +
                    momentDate.format('YYYY')
                ).append(
                    $('<span>').addClass('ui-li-count').text(result[date].length)
                );

                $(listview).append(liContainer);

                for (var i = 0; i < result[date].length; i++) {

                    var row = result[date][i];

                    app.info(row);

                    var a = $('<a>')
                        .attr('href', '#').addClass(
                            'ui-icon-' + (row['sincronizado'].toLowerCase() === 'sim' ? 'check' : 'clock')
                        )
                        .append(
                            $('<h2>').html(row['tipo-despesa'])
                        )
                        .append(
                            'R$ ' + $('<p>').append($('<strong>').html(row['valor'])).html()
                        )
                        .append(
                            $('<p>').html(row['forma-pagamento'])
                        )
                        .append(
                            $('<p>').html(
                               row['forma-pagamento'].toLowerCase() == 'dinheiro'
                            || row['forma-pagamento'].toLowerCase() == 'vale alimentação'
                            ? ''
                            : 'Conta: ' + row.conta
                        ))
                        .append(
                            $('<p>').html('Sincronizado: ' + row['sincronizado'])
                        )
                        .append(
                            $('<p>').addClass('ui-li-aside').append($('<strong>').html(row.hora)
                        ))
                    ;

                    $(listview).append($('<li>').append(a));
                }
            }

            $(document).find('#listar .listar').listview('refresh');

        }, app.errorCB);
    },

    successCB: function() {
        app.info("Success database command!");
    },

    errorCB: function(error) {

        app.log(error);

        var message = "Error processing SQL [" + error.code + ']: ' + error.message;

        navigator.notification.alert(
            message,                // message
            function(){},           // alertCallback
            'Contas Mensais',       // title
            'OK'                    // buttonName
        );
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        moment.lang('pt-br');

        // -----------------------------------------------------------------
        // Cria a base de dados

        app.db = window.openDatabase('contas', '', 'Contas Mensais', 1000000);

        if(app.db.version == '') {
            app.db.changeVersion('', '1.0', app.updateDatabaseToVersion('1.0'));
        }

        if(app.db.version == '1.0') {
            app.db.changeVersion('1.0', '1.1', app.updateDatabaseToVersion('1.1'));
        }

        // -----------------------------------------------------------------
        // Evento disparado ao selecionar uma página

        $(document).on('pagecontainerbeforetransition', function(event, ui) {

            app.info(ui.toPage[0].id);

            if (ui.toPage[0].id == 'listar') {

                app.db.transaction(app.renderGrid, app.errorCB, app.successCB);
            }
        });

        $(document).on('pagechange', function() {

            var idPageActive = $('.ui-page-active', 'body').attr('id');

            if (idPageActive === 'resumo') {

                $('#resumo .tipo-despesa').val(app.value['tipo-despesa']);

                $('#resumo .valor').val(app.value['valor']);

                $('#resumo .forma-pagamento').val(app.value['forma-pagamento']);

                if (app.value['conta'] != null) {
                    $('#resumo .conta').val(app.value['conta']);
                }

            } else if (idPageActive === 'despesa') {

                $(document).find('#despesa .valor').maskMoney({
                    'symbol'    : 'R$',
                    'decimal'   : '.',
                    'thousands' : ''
                });

            }

            return false;
        });

        // -----------------------------------------------------------------
        // Atualiza o objeto que armazena os valores informados pelo usuário

        $(document).on('click', '.ui-content ul[data-role="listview"] li a', function() {

            var value = $(this).data('value');

            if (value) {
                app.value[$(this).data('value')] = $(this).text();
            }
        });

        $(document).on('click', '#despesa #avancar', function() {

            var valor = $('#despesa .valor').val();

            app.info(valor);

            if (valor === '') {
                $('#despesa .message').html('Preencha o valor da despesa!');
                return false;
            }

            app.value['valor'] = valor;
        });

        // -----------------------------------------------------------------
        // Manipula o botão sincronizar

        $(document).on('click', '#sincronizar .sincronizar', function() {

            var networkState = navigator.connection.type;

            if (networkState === Connection.WIFI) {

                // $.ajax({
                //     type    : 'POST',
                //     url     : 'http://localhost/contas/web/app_dev.php/api/conta/sincronizar',
                //     data    : {
                //         'cekurte_home_adminbundle_contaform': {
                //             'tipoDespesa'   : 'Comida',
                //             'formaPagamento': 'Dinheiro',
                //             'conta'         : 'BB',
                //             'valor'         : '1.23',
                //             'data'          : {
                //                 'date'      : {
                //                     'day'   : 1,
                //                     'month' : 12,
                //                     'year'  : 2014
                //                 },
                //                 'time'      : {
                //                     'hour'  : 0,
                //                     'minute': 0
                //                 }
                //             }
                //         }
                //     },
                //     success : function(result) {
                //         console.info(result);
                //     },
                //     dataType: 'json'
                // });

                navigator.notification.alert(
                    'Sincronizando...',     // message
                    function(){},           // alertCallback
                    'Contas Mensais',       // title
                    'OK'                    // buttonName
                );

            } else {
                navigator.notification.alert(
                    'Você não está conectado a uma Rede Wifi!',     // message
                    function(){},           // alertCallback
                    'Contas Mensais',       // title
                    'OK'                    // buttonName
                );
            }

            return false;
        });

        // -----------------------------------------------------------------
        // Manipula o botão salvar da página de resumo

        $(document).on('click', '#resumo .confirmar', function() {

            app.db.transaction(app.inserirConta, app.errorCB, function() {

                navigator.notification.alert(
                    'Despesa incluída com sucesso!',     // message
                    function(){},           // alertCallback
                    'Contas Mensais',       // title
                    'OK'                    // buttonName
                );

                $.mobile.changePage('index.html', {
                    transition: "slide"
                });
            });
        })
    },
};