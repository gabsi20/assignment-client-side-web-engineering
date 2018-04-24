import { d } from "../src/monad";

describe("01-fp", () => {
  describe("Monads", () => {
    it("should construct, wrap and lift", () => {
      const $ = d()
        .extend("style", function(style) {
          Object.assign(this, { style });
          return this;
        })
        .extend("fadeOut", function() {
          Object.assign(this, { opacity: 0 });
          return this;
        });

      const result = $({})
        .style({ color: "red" })
        .fadeOut();

      result.should.have.property("style").which.is.a.Object();
      result.style.should.have.property("color").which.is.a.String();
      result.style.color.should.eql("red");

      result.should.have.property("opacity").which.is.a.Number();
      result.opacity.should.eql(0);
    });
  });
});
