from pythermalcomfort.models import pmv
from pythermalcomfort.utilities import v_relative, clo_dynamic
from ladybug_comfort.pmv import predicted_mean_vote

tdb = 26.7
tr = 26.51
rh = 70.89
v = 0.0
met = 1.24
clo = 0.5
# calculate relative air speed
v_r = v_relative(v=v, met=met)
# calculate dynamic clothing
clo_d = clo_dynamic(clo=clo, met=met)
results = pmv(tdb=tdb, tr=tr, vr=v_r, rh=rh, met=met, clo=clo_d, standard='ashrae')
print(results)
results = predicted_mean_vote(tdb, tr, v_r, rh, met, clo)['pmv']
print(results)