/**
 * Collection of Lottie animations optimized for the application
 * These animations are lightweight and optimized for performance
 */

// Simple loading animation (pulsing circle)
export const loadingAnimation = {
  v: "5.7.6",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Loading",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [100, 100, 0], ix: 2, l: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
        s: {
          a: 1,
          k: [
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 0,
              s: [75, 75, 100]
            },
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 30,
              s: [100, 100, 100]
            },
            { t: 60, s: [75, 75, 100] }
          ],
          ix: 6,
          l: 2
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [100, 100], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              nm: "Ellipse Path 1",
              mn: "ADBE Vector Shape - Ellipse",
              hd: false
            },
            {
              ty: "st",
              c: { a: 0, k: [0.23, 0.47, 0.94, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 6, ix: 5 },
              lc: 1,
              lj: 1,
              ml: 4,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Ellipse 1",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// Celebration animation (small confetti)
export const celebrationAnimation = {
  v: "5.7.6",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Celebration",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Confetti",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [100, 100, 0], ix: 2, l: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
        s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
      },
      ao: 0,
      shapes: Array.from({ length: 8 }, (_, i) => ({
        ty: "gr",
        it: [
          {
            ty: "rc",
            d: 1,
            s: { a: 0, k: [7, 7], ix: 2 },
            p: { a: 0, k: [0, 0], ix: 3 },
            r: { a: 0, k: 2, ix: 4 },
            nm: `Rectangle ${i+1}`,
            mn: "ADBE Vector Shape - Rectangle",
            hd: false
          },
          {
            ty: "fl",
            c: {
              a: 0,
              k: [
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1
              ],
              ix: 4
            },
            o: { a: 0, k: 100, ix: 5 },
            r: 1,
            bm: 0,
            nm: `Fill ${i+1}`,
            mn: "ADBE Vector Graphic - Fill",
            hd: false
          },
          {
            ty: "tr",
            p: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 0,
                  s: [0, 0]
                },
                {
                  t: 60,
                  s: [
                    (Math.random() - 0.5) * 180,
                    (Math.random() - 0.5) * 180
                  ]
                }
              ],
              ix: 2
            },
            a: { a: 0, k: [0, 0], ix: 1 },
            s: { a: 0, k: [100, 100], ix: 3 },
            r: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 0,
                  s: [0]
                },
                { t: 60, s: [Math.random() * 360] }
              ],
              ix: 6
            },
            o: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 0,
                  s: [0]
                },
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 10,
                  s: [100]
                },
                { t: 50, s: [0] }
              ],
              ix: 7
            },
            sk: { a: 0, k: 0, ix: 4 },
            sa: { a: 0, k: 0, ix: 5 },
            nm: "Transform"
          }
        ],
        nm: `Particle ${i+1}`,
        np: 3,
        cix: 2,
        bm: 0,
        ix: i+1,
        mn: "ADBE Vector Group",
        hd: false
      })),
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// Check animation (for completion)
export const checkAnimation = {
  v: "5.7.6",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "Check",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [50, 50, 0], ix: 2, l: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
        s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              closed: false,
              ks: {
                a: 1,
                k: [
                  {
                    i: { x: 0.667, y: 1 },
                    o: { x: 0.333, y: 0 },
                    t: 5,
                    s: [
                      {
                        i: [
                          [0, 0],
                          [0, 0]
                        ],
                        o: [
                          [0, 0],
                          [0, 0]
                        ],
                        v: [
                          [-15, 0],
                          [-15, 0]
                        ],
                        c: false
                      }
                    ]
                  },
                  {
                    i: { x: 0.667, y: 1 },
                    o: { x: 0.333, y: 0 },
                    t: 15,
                    s: [
                      {
                        i: [
                          [0, 0],
                          [0, 0]
                        ],
                        o: [
                          [0, 0],
                          [0, 0]
                        ],
                        v: [
                          [-15, 0],
                          [0, 15]
                        ],
                        c: false
                      }
                    ]
                  },
                  {
                    t: 25,
                    s: [
                      {
                        i: [
                          [0, 0],
                          [0, 0],
                          [0, 0]
                        ],
                        o: [
                          [0, 0],
                          [0, 0],
                          [0, 0]
                        ],
                        v: [
                          [-15, 0],
                          [0, 15],
                          [15, -15]
                        ],
                        c: false
                      }
                    ]
                  }
                ],
                ix: 2
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "st",
              c: { a: 0, k: [0.1, 0.7, 0.2, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 6, ix: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Check",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 30,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// Number animation (counter)
export const counterAnimation = (start = 0, end = 100) => ({
  v: "5.7.6",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "Counter",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 5,
      nm: "Number",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [50, 50, 0], ix: 2, l: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
        s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
      },
      ao: 0,
      t: {
        d: {
          k: [
            {
              s: {
                s: 24,
                f: "Arial-BoldMT",
                t: start.toString(),
                j: 2,
                tr: 0,
                lh: 28.8,
                ls: 0,
                fc: [0.23, 0.47, 0.94]
              },
              t: 0
            },
            {
              s: {
                s: 24,
                f: "Arial-BoldMT",
                t: end.toString(),
                j: 2,
                tr: 0,
                lh: 28.8,
                ls: 0,
                fc: [0.23, 0.47, 0.94]
              },
              t: 30
            }
          ]
        },
        p: {},
        m: {
          g: 1,
          a: {
            a: 0,
            k: [0, 0],
            ix: 2
          }
        },
        a: []
      },
      ip: 0,
      op: 30,
      st: 0,
      bm: 0
    }
  ],
  markers: []
});

// Export additional animations as needed 