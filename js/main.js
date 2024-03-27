$(document).ready(function(){
	$('.cont_login').addClass('fadeInDown');
	setInterval(function(){
		if ($('#id_username').val() != ""){
			$('.inner_cir').addClass('flipped');
		}
	}, 100);
});

$('.js-form input:visible').keyup(function(){
	validate();
});

$('.inner_cir .back button').hover(function () {
	$(this).addClass('pulse');
}, function () {
	$(this).removeClass('pulse');
});

function validate() {
	var campos = $('.js-form input:visible');
	function checkForm() {
		camposVacios = campos.filter(function(){
			return $.trim(this.value) === "";
		})
	    if (camposVacios.length) {
			if($('.inner_cir').hasClass('flipped')){
				$('.inner_cir').removeClass('flipped');
			}
	    } else {
	        $('.inner_cir').addClass('flipped');
	    }
	}
	campos.keyup(checkForm);
	checkForm();
}



$('.js-btn-switch-login').click(function(event){
	event.preventDefault();
	var btn = $(this);
	if (btn.hasClass('admin')){
		$('#user').slideUp('fast');
		btn.addClass('user').removeClass('admin');
		$('.js-btn-switch-login').text('Cambiar a acceso de usuario.');
		$('#id_password').attr('name', 'lock-preview-password')
		setTimeout('validate();', 300);
	} else if ($(this).hasClass('user')){
		$('#user').attr('value','').slideDown('fast');
		btn.addClass('admin').removeClass('user');
		$('.js-btn-switch-login').text('Cambiar a acceso de invitado.');
		$('#id_password').attr('name', 'password')
		setTimeout('validate();', 300);
	}
});
