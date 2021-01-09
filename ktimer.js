/*


time framework
use cases:
1. loop change values through table
2. one time change values through table
3. any time stop
4. any time pause/resume
5. able to use callback

app {
timers = Timers();

timerId = timers.add({

name: name,
currentTime: currentTime, // can be stopped by switch active
currentValues: [],
repeat: true (false),
active: true (false),
table: [
{ time: time0, values: [ ..... ] },
{ time: time1, values: [ ..... ] },
{ time: time2, values: [f20, f21, ..... ] },
// function means dependancy from time at current range.
Last function have mo meaning, because no range

if need to create link to other parameter, then curry funciton should be passed:
{ time: time5, values[
  (influencingParameterReference) => () => influencingParameterReference.x + sin(this.currentTime),
  ....
]}

],
cb: cbfunc, //  ((this1) => cbfunc)(this)
cb_end: when timer ended
cb_stop:
cb_pause:
cb_resume:

  // example of implementation
  function cbfunc(this, intervalNumber, rangePosition) {
    this.current = timers.getParamParam(this.t, this.table);
    app.objects[iObject].position  = this.current;
}

stop(timer)
pause(timer)
resume(timer)

}

)
}


 */

function Timer2() {
    var tt = [];

    // input:
    // p -  value from 0 to 1
    // array of states from the beginning to end
    // state is object {t: time, v: array}
    function get_param_param_1(p, a) {
        //var a = table
        function getIntervalNumber(v, a) {
            for (var i=0; i<a.length; i++) {
                if (v <= a[i+1]) return i;
            };
            return  a.length-1;
        };
        // return proportion from i and i+1 states bases on distance
        function getIntervalProportion(v, i, a) {
            if (v === a[i]) return 0;
            return (v- a[i]) / (a[i+1] - a[i]);
        }
        var pn = p ; // a[a.length - 1].time - a[0].time;

        var a1 = a.map(e => e.time);
        var i = getIntervalNumber(pn, a1);
        
        var i1 = getIntervalProportion(pn, i, a1);
        //console.log('------------', pn, i, i1, a1);
        var rez = [];
        for (var j=0; j<a[0].values.length; j++) {
            if (typeof(a[i].values[j]) === 'function') {
                rez.push(a[i].values[j](i1));
            //       rez.push(a[i].v[j])
            } else {
            rez.push(a[i].values[j] + i1 * (a[i+1].values[j] - a[i].values[j]));
            }
        }

        return rez;
    } // get param param

    // return current state
    // p = time - timestart
    // a - table
    function get_param_param2(p, a) {
        let delta = a[a.length - 1].time - a[0].time;
        return get_param_param_1(p % delta, a);
    }
//чт 17.00

    var t = {
        tt: tt,
        time: 0,
        add: function (p) {
            //var t1 = Object.assign(p);
            if ( !p.hasOwnProperty('active') ) p.active = true;
            if ( !p.hasOwnProperty('repeat')) p.repeat = false;
            p.currentState = p.table[0].values.slice();
            p.timeStart = p.table[0].time;
            p.timeStartTS = Date.now();
            p.timeEnd = p.table[p.table.length - 1].time;
            p.time = p.timeStart;
            p.time = Date.now()
            tt.push(p);
            let n = tt.length -1 ;
            p.n = n;
            if (tt[n].cbStart) tt[n].cbStart(this);
            //return n;
            p.pause = ((p) => () => {p.active = false; })(p)
            p.start = ((p) => () => {p.active = true; })(p)
            return p;
        },
        pause: function (ti, cb) {
            tt[ti].active = false;
            if (cb !== undefined) cb();
            if (tt[ti].cbStop) tt[ti].cbPause();

        },
        stop: function (ti, cb) { // same as pause for this moment
            tt[ti].active = false;
            if (cb !== undefined) cb();
            if (tt[ti].cbStop) tt[ti].cbStop();
        },
        start: function(ti) {
            console.log('starting timer .....', ti, tt);
            tt[ti].active = true;
            console.log('tt ', tt[ti]);
        },
        delete: function(ti) {
            
        },
        tick: function () {
            var oldTime = this.time;
            this.time = Date.now();
            var deltaTime = this.time - oldTime;
            //var elapsedTime = this.time - 

            //console.log('deltatime ',deltaTime, tt);

            for (var i =0; i<tt.length; i++) {
                tt[i].time = this.time - tt[i].timeStartTS;
                //tt[i].time += deltaTime;
                //if ((tt[i].time > tt[i].timeStart + tt[i].timeEnd) && tt[i].repeat === false) tt[i].active = false;
                if ((tt[i].time > tt[i].timeEnd) && tt[i].repeat === false) {
                    tt[i].active = false;
                }
                //if ((deltaTime > tt[i].timeStart + tt[i].timeEnd) && tt[i].repeat === false) tt[i].active = false;
                if (tt[i].active) {

                    tt[i].currentState = get_param_param2(
                        tt[i].time - tt[i].timeStart, tt[i].table);
                    //console.log('assign curr state ', tt[i].currentState, tt[i].time, tt[i])
                    //tt[i].cb(this);
                    tt[i].cb(tt[i]);
                }
            }
        }
    };
    return t;
} // Timer