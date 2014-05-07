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

    // Tipo de Despesa
    tipoDespesa: null,

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
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        $('#tipo_despesa li a').on('click', function() {
            $('#valor').val('');
            app.tipoDespesa = $(this).text();
        });

        $("#valor").maskMoney({
            'symbol': 'R$',
            'decimal': ',',
            'thousands': '.'
        });

        $(document).on('pagecontainerbeforeshow', function(event, ui) {

            console.log(this);

            return false;
        });

        $('#salvar').on('click', function() {

            var valor   = $('#valor').val();

            navigator.notification.confirm(
                'Você confirma a inclusão da despesa abaixo?'   + '\n' +
                'Tipo da Despesa: ' + app.tipoDespesa           + '\n' +
                'Valor: R$ '        + valor,
                function(opcao) {
                    if (opcao === 1) {
                        navigator.notification.alert('Despesa incluída com sucesso!', function(){}, 'Confirmação', 'Fechar');
                    }
                },
                'Incluir Despesas',
                'Confirmar,Cancelar'
            );
        })
    },
};