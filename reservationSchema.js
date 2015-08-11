/**
 * Created by mohammad on 8/11/15.
 */
var requestSchema = new Schema( {
	Applicant: String,
	request: String,
	responder: String,
	status: String,

	date: { type: Date, default: Date.now }

} );