import { Sono } from "jsr:@sono/core";
const sono = new Sono();
Deno.serve(async (req) => {
    return sono.connect(req);
});
