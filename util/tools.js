let trigger = function (fn, method, args) {
    let _fn = fn;
    method.forEach((item, i) => {
        _fn = _fn[item]
    });
    return _fn.apply(this, args)
};

module.exports = {
    trigger: trigger,
};