;(function () {
    
    const today = new Date();
    // console.log(today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone : 'UTC' }));
    // console.log("DIA: ",today.getUTCDate())
    // console.log("MES: ", today.toLocaleString('default', { month: 'long' }))
    // console.log("ANO: ",today.getFullYear())

    const day = today.getUTCDate();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    $('[data-date-day]').html(day.toString().padStart(2, "0"));
    $('[data-date-month]').html(month);
    $('[data-date-year]').html(year);

    if($('#countdown').length){
        countdown();
    }
    
    if($('body').data('page') == 'lower_thirds'){
        
        setInterval(function(){
            $('.caption-2').toggleClass('fadeOut');
        },180000)

    }

    
}());
  