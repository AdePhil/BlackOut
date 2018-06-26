$('.header__mobile').click(function (e) {
    e.stopPropagation();
    $('.header__nav').toggleClass('active');
});

$(document.body).click(function () {
    $('.header__nav').removeClass('active');
});