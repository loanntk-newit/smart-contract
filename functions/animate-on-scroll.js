const callbackToBottom = function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-toBottom')
    } else {
      entry.target.classList.remove('animate-toBottom')
    }
  })
}

const callbackToRight = function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-toRight')
    } else {
      entry.target.classList.remove('animate-toRight')
    }
  })
}

const callbackToLeft = function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-toLeft')
    } else {
      entry.target.classList.remove('animate-toLeft')
    }
  })
}

const callbackFadeIn = function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fadeIn')
    } else {
      entry.target.classList.remove('animate-fadeIn')
    }
  })
}

const callbackToTop = function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-toTop')
    } else {
      entry.target.classList.remove('animate-toTop')
    }
  })
}

if (typeof window !== 'undefined') {
  const toBottom = new IntersectionObserver(callbackToBottom)
  const targetsToBottom = document.querySelectorAll('.show-animate-toBottom')
  targetsToBottom.forEach(function (target) {
    toBottom.observe(target)
  })

  const toRight = new IntersectionObserver(callbackToRight)
  const targetsToRight = document.querySelectorAll('.show-animate-toRight')
  targetsToRight.forEach(function (target) {
    toRight.observe(target)
  })

  const fadeIn = new IntersectionObserver(callbackFadeIn)
  const targetsFadeIn = document.querySelectorAll('.show-animate-fadeIn')
  targetsFadeIn.forEach(function (target) {
    fadeIn.observe(target)
  })

  const toTop = new IntersectionObserver(callbackToTop)
  const targetsToTop = document.querySelectorAll('.show-animate-toTop')
  targetsToTop.forEach(function (target) {
    toTop.observe(target)
  })

  const toLeft = new IntersectionObserver(callbackToLeft)
  const targetsToLeft = document.querySelectorAll('.show-animate-toLeft')
  targetsToLeft.forEach(function (target) {
    toLeft.observe(target)
  })
}
