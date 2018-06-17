const camelCase = require("camelcase");
const { db } = require("../db");
const config = require("../config");

module.exports = {
  namespace: "yard",
  state: {
    wagons: [],
    locomotives: [],
    tracks: [],
    selectedTrack: false
  },
  subscriptions: [
    (send, done) => {
      db.replicate
        .from(config.db.dsn)
        .on("complete", () => {
          db
            .get("yard")
            .then(state =>
              send("yard:setInitialState", state, err => {
                if (err) {
                  console.error(err);
                }
              })
            )
            .catch(err => console.error(err));

          db
            .sync(config.db.dsn, { live: true, retry: true })
            .on("change", ({ change }) => {
              change.docs.forEach(doc => {
                const { type = false } = doc;

                if (doc._id === "yard") {
                  return send("yard:setInitialState", doc, err =>
                    console.error(err)
                  );
                }

                send(
                  `yard:update${camelCase(type, { pascalCase: true })}`,
                  doc,
                  err => {
                    if (err) {
                      console.error(err);
                    }
                  }
                );
              });
            });
        })
        .on("error", err => console.error(err));
    }
  ],
  effects: {

  },
  reducers: {
    setInitialState: (data, state) => data,
    updateTrack: (data, state) => {
      console.log(data);
      return state;
    },
    moveWagon: (_, state) => {
      if (state.wagons.length === 0) {
        return state;
      }

      let locomotives = state.locomotives;
      const track = state.tracks[state.selectedTrack];

      if (track.queue.length === 0 && locomotives.length === 0) {
        return state;
      }

      if (track.queue.length === 0) {
        locomotives.pop();
        track.queue.push('steam_locomotive');
      }
      track.queue.push("railway_car");

      return {
        ...state,
        locomotives,
        wagons: [...state.wagons.slice(1)]
      };
    },
    refill: (_, state) => ({
      ...state,
      wagons: Array.from({ length: 10 }, () => "railway_car")
    }),
    scheduleTrack: (el, state) => {
      const track = state.tracks[state.selectedTrack];
      track.queue = [];
      return state;
    },
    selectTrack: (el, state) => {
      return {
        ...state,
        selectedTrack: Number(el.target.value)
      };
    }
  }
};
