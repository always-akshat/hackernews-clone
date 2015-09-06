/**
 * Created by akshat on 6/9/15.
 */




$(document).ready(function(){
    $('#login-form-link').click(function(e) {
        console.log('inside login click');
        alert('asdasd');
        $("#login-form").delay(100).fadeIn(100);
        $("#register-form").fadeOut(100);
        $('#register-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

    $('#register-form-link').click(function(e) {
        $("#register-form").delay(100).fadeIn(100);
        $("#login-form").fadeOut(100);
        $('#login-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

    $('#btn-signup').click(function(event) {

        var email, password, confirmPassword,error=[];

        email = $('input[name=signUpEmail]').val();
        password = $('input[name=signUpPassword]').val();
        confirmPassword = $('input[name=signUpConfirmPassword]').val()

        if(!email || !password || !confirmPassword){
            error.push('All fields are mandatory');
        }else if(password !== confirmPassword){
            error.push('passwords do not match');
        }else {
            var formData = {
                'email': $('input[name=signUpEmail]').val(),
                'password': $('input[name=signUpPassword]').val()
            };
            $.ajax({
                type: 'POST',
                url: 'api/v1/user/register',
                data: formData,
                dataType: 'json',
                encode: true,
                success: function(data){
                    console.log(data);
                    if(data && data.token) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("email", formData.email);
                        window.location.href = "login";
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    if(xhr.responseJSON && xhr.responseJSON.error){
                        console.log(xhr.responseJSON.error);
                    }else{
                        console.log(xhr.responseText)
                    }
                }
            });

        }

        if(error && error.length){
            console.log(error);
        }

        event.preventDefault();

    });

    $('#btn-login').click(function(event) {

        var email, password,error=[];

        email = $('input[name=loginEmail]').val();
        password = $('input[name=loginPassword]').val();

        if(!email || !password){
            error.push('All fields are mandatory');
        }else {
            var formData = {
                'email': $('input[name=loginEmail]').val(),
                'password': $('input[name=loginPassword]').val()
            };
            $.ajax({
                type: 'POST',
                url: 'auth/local',
                data: formData,
                dataType: 'json',
                encode: true,
                success: function(data){
                    console.log(data);
                    if(data && data.token) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("email", data.email);
                        window.location.href = "feed";
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    if(xhr.responseJSON && xhr.responseJSON.error){
                        console.log(xhr.responseJSON.error);
                    }else{
                        console.log(xhr.responseText)
                    }
                }
            });
        }

        if(error && error.length){
            console.log(error);
        }

        event.preventDefault();

    });
});
