import { expect } from "chai";
import request from "supertest";
import app from "..";

const ROOT = "/api/v1/wallet";
const recoveryPhrase: string[] = [
  "denial",
  "filial",
  "fantasy",
  "philosophical",
  "faint",
  "apparition",
  "bloat",
  "garrison",
  "loch-ness",
  "pitiable",
  "admiral",
  "quality",
  "infer",
  "subtle",
  "torpor",
  "morbid"
];
let token: string = "";

describe("TESTS", () => {
  describe("WALLET IMPLEMENTATION TESTS", () => {
    it("should create wallet", done => {
      request(app)
        .post(ROOT + "/create")
        .send({ recoveryPhrase })
        .end((err, res) => {
          console.table([res.body.response.wallet]);
          token += res.body.response.token;
          expect(res.status).to.be.eql(201);
          done(err);
        });
    });
    it("should retrieve wallet", done => {
      request(app)
        .get(ROOT + "/retrieve")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          console.table([res.body.response]);
          expect(res.status).to.be.eql(200);
          done(err);
        });
    });
  });
});
