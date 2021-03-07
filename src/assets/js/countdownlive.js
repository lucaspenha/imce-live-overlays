function countdown(){
    
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    // Set the date we're counting down to
    var countDownDate = new Date();
    countDownDate.setHours(18, 00, 00, 0) 
    var dayOfWeek = countDownDate.getDay();
    if(dayOfWeek != 0){
        countDownDate = countDownDate.addDays(7-dayOfWeek);
    };

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = (countDownDate >= now) ? countDownDate - now : 0; 

        // Time calculations for days, hours, minutes and seconds
        //var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        //var hours = Math.floor((distance) / (1000 * 60 * 60));
        var minutes = Math.floor((distance) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"

        var countDownCaracters = minutes + ":" + (seconds<10?"0"+seconds:seconds);

        if(distance == 0){
            stop();
            countDownCaracters = "Em alguns instantes, vamos iniciar...";
            document.getElementById("countdown").classList.add("wait");
        }

        document.getElementById("countdown").innerHTML = countDownCaracters;

    }, 1000);

    var stop = function(){
        clearInterval(x);
    }

}