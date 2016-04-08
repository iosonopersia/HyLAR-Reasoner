/**
 * Created by aifb on 06.04.16.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var H = require('../hylar/core/Hylar');
var repository = new H(),
    localfunctionalities = new H();

describe('Asawoo incomplete functionalities', function () {
    it('should return incomplete functionalities', function () {
        var owlRepository = fs.readFileSync(path.resolve(__dirname + '/ontologies/modified_functionalities.jsonld')),
            extensionOwlRepository = path.extname(path.resolve(__dirname + '/ontologies/modified_functionalities.jsonld')),
            owlFunctCompositions = fs.readFileSync(path.resolve(__dirname + '/ontologies/functionality_compositions.jsonld')),
            extensionOwlFunctCompositions = path.extname(path.resolve(__dirname + '/ontologies/functionality_compositions.jsonld')),

            triplesToBeInsertedQuery =
            'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> CONSTRUCT { ?fun rdf:type asawoo:Functionality } WHERE { <http://liris.cnrs.fr/asawoo#WindowMotor> asawoo:hasCapability ?cap . { ?fun asawoo:isImplementedBy ?cap . } UNION { ?fun asawoo:isComposedOf* ?funComp . ?funComp asawoo:isImplementedBy ?cap . } }',

            insertQuery = 'INSERT DATA { ',

            incompleteFunctionalitiesQuery = 'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?fun WHERE { ?fun asawoo:isComposedOf ?funComp . ?fun asawoo:isComposedOf ?funComp2 . ?funComp2 rdf:type asawoo:Functionality . FILTER NOT EXISTS { ?funComp rdf:type asawoo:Functionality . } }',

            mimeType = mime.contentType(extensionOwlRepository);

        if(mimeType) {
            mimeType = mimeType.replace(/;.*/g, '');
        }
        owlRepository = owlRepository.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');

        return repository.load(owlRepository, mimeType)
            .then(function(r) {
                return repository.query(triplesToBeInsertedQuery);
            })
            .then(function(r) {
                insertQuery += r.triples.join('') + ' }';
                mimeType = mime.contentType(extensionOwlRepository);
                if(mimeType) {
                    mimeType = mimeType.replace(/;.*/g, '');
                }
                owlFunctCompositions = owlFunctCompositions.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                return localfunctionalities.load(owlFunctCompositions, mimeType);
            })
            .then(function(r) {
                return localfunctionalities.query(insertQuery);
            })
            .then(function(r) {
                return localfunctionalities.query(incompleteFunctionalitiesQuery);
            })
            .then(function(r) {
                r.length.should.equal(2)
                r[0]['fun']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulation')
                r[1]['fun']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulationBySMS')
            })
    });
});