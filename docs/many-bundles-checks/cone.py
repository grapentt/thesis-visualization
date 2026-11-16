import numpy as np
# axis e(t) goes counterclockwise (seen from +z, i.e. from outside the north cap) around a cone of half-angle a about z
for adeg in (30, 60, 90):
    a = np.radians(adeg); n = 200000
    ts = np.linspace(0, 2*np.pi, n+1)
    e = lambda t: np.array([np.sin(a)*np.cos(t), np.sin(a)*np.sin(t), np.cos(a)])
    f = np.array([np.cos(a), 0, -np.sin(a)])  # tangent vector at t=0 (pointing "south")
    f0 = f.copy()
    for k in range(n):
        t0, t1 = ts[k], ts[k+1]
        e0, e1 = e(t0), e(t1)
        om = np.cross(e0, e1)  # minimal rotation (no spin about e)
        s = np.linalg.norm(om)
        if s > 0:
            k_ = om/s; ang = np.arcsin(min(s,1))
            f = f*np.cos(ang) + np.cross(k_, f)*np.sin(ang) + k_*(k_@f)*(1-np.cos(ang))
    e_end = e(0.0)
    # signed angle from f0 to f about outward normal e_end
    sang = np.degrees(np.arctan2(np.cross(f0, f)@e_end, f0@f))
    print("half-angle %d: rotation of lips about outward axis = %.3f deg; solid angle = %.3f deg" % (adeg, sang, np.degrees(2*np.pi*(1-np.cos(a)))))
