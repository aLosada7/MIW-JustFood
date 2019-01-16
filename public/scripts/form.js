$( document ).ready(function() {

    $("#empresaSi").click(() => {
        $("#datosEmpresa").prop("hidden",false);
    });
    $("#empresaNo").click(() => {
        $("#datosEmpresa").prop("hidden",true);
    });

    $("#inversionesSi").click(() => {
        $("#bloqueSector").prop("hidden",false);
    });
    $("#inversionesNo").click(() => {
        $("#bloqueSector").prop("hidden",true);
    });

    $("#llamadasSi").click(() => {
        $("#bloqueTelefono").prop("hidden",false);
        $("#bloqueCita").prop("hidden",false);
    });
    $("#llamadasNo").click(() => {
        $("#bloqueTelefono").prop("hidden",true);
        $("#bloqueCita").prop("hidden",true);
    });

    $('#datetimepicker1').datetimepicker();

});