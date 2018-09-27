const fs = require('fs');
const path = require('path');
const to = require('await-to-js').default;
const Student = require('@models/student');
const Questionnaire = require('@models/questionnaire');
const logger = require('@root/logger');

// Вспомогательная функция, цель которой убрать credentials которая содержит
// пароль и вытащить оттуда email
unnestStudent = function(student) {
    var result = {};
    result.id = student.id;
    result.email = student.credentials.email;
    result.firstName = student.firstName;
    result.lastName = student.lastName;
    result.phone = student.phone;
    result.description = student.description;
    result.vacancies = student.vacancies;
    return result;
}

// Student Controller functions that are used to get/set profile info.
module.exports = {
    // Update first name of the user
    updateFirstName: (req, res, next) => {
        if (req.body.firstName === undefined) {
            return res.status(400).json({error: "firstName not received"});
        }
        // Find the user -> update first name -> save
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.firstName = req.body.firstName;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    // Get student's first name by id.
    getFirstName: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "firstName": student.firstName });
        })
    },

    updateLastName: (req, res, next) => {
        if (req.body.lastName === undefined) {
            return res.status(400).json({error: "lastName not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.lastName = req.body.lastName;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getLastName: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "lastName": student.lastName });
        })
    },

    updatePhone: (req, res, next) => {
        if (req.body.phone === undefined) {
            return res.status(400).json({error: "phone not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.phone = req.body.phone;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getPhone: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "phone": student.phone });
        })
    },

    updateDescription: (req, res, next) => {
        if (req.body.description === undefined) {
            return res.status(400).json({error: "description not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.description = req.body.description;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getDescription: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "description": student.description });
        })
    },

    saveProfilePicture: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }
            console.log(student);
            student.profileThumbnail = req.files.picture.data;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        });
    },

    // Get full profile information, excluding password and registration method
    getFullProfile: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({ error: "Student not found" });
            }

            return res.status(200).json(unnestStudent(student));
        });
    },

    // Get profile information based on request:
    // Input example:
    //      {"id": true, "email": true}
    // Output:
    //      {"id": "... student id ...", "email": "johndoe@hotmail.com"}
    getProfile: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }
            var result = {};
            if (req.body.id !== undefined) {
                result.id = student.id;
            }
            if (req.body.email !== undefined) {
                result.email = student.credentials.email;
            }
            if (req.body.firstName !== undefined) {
                result.firstName = student.firstName;
            }
            if (req.body.lastName !== undefined) {
                result.lastName = student.lastName;
            }
            if (req.body.phone !== undefined) {
                result.phone = student.phone;
            }
            if (req.body.description !== undefined) {
                result.description = student.description;
            }
            return res.status(200).json(result);
        });
    },

    // Update profile information
    // Input example:
    //      {"email": "some_email@gmail.com", "firstName": "John"}
    updateProfile: (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }
            if (req.body.email !== undefined) {
                student.credentials.email = req.body.email;
            }
            if (req.body.password !== undefined) {
                student.credentials.password = req.body.password;
            }
            if (req.body.firstName !== undefined) {
                student.firstName = req.body.firstName;
            }
            if (req.body.lastName !== undefined) {
                student.lastName = req.body.lastName;
            }
            if (req.body.phone !== undefined) {
                student.phone = req.body.phone;
            }
            if (req.body.description !== undefined) {
                student.description = req.body.description;
            }
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json(unnestStudent(updatedStudent));
            });
        });
    },

    // Puts Student's avatar image into dir_path folder, sets the name to student's id.
    updateImage: (dir_path) => {
        return (req, res, next) => {
            var file = req.files.avatar;

            logger.debug(file.name);

            var image_name = req.account.id;
            //TODO: support jpg.
        	if (file.mimetype === 'image/png') {
        		image_name += '.png';
        	} else {
        		return res.status(415).send({error: "unsupported file type"});
        	}

            fs.writeFile(path.join(dir_path, image_name), file.data, function(err) {
        		if (err) {
        			return res.status(500).send({error: err.message});
        		}
                return res.status(200).send({status: 'ok'});
        	});
        }
    },

    // Создать(обновить если существует) ответ на вопрос
    //
    // POST /student/questionnaire/answer/:setNumber/:questionNumber
    // req.body: {
    //      answers: [String]
    // }
    updateQuestionnaireAnswer: async (req, res, next) => {
        var err, questionSet, answer;

        // Находим сет вопросов в базе данных
        [err, questionSet] = await to(
            Questionnaire.QuestionSet.findOne({
                setNumber: req.params.setNumber,
            })
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если сета вопросов нет, то возвращаем ошибку
        if (!questionSet) {
            return res.status(409).json({ error: "question set not found" });
        }

        // Находим индекс вопроса в массиве
        var questionIndex = questionSet.questions.findIndex(
            Questionnaire.findQuestion(parseInt(req.params.questionNumber))
        );

        // Если вопроса не существует, то возвращаем ошибку
        if (questionIndex === -1) {
            return res.status(400).json({ error: "question not found" });
        }

        // Если ответов несколько а тип вопроса не многовариантный, возвращаем ошибку
        if (questionSet.questions[questionIndex].questionType !== "multichoice"
                && req.body.answers.length > 1) {
            return res.status(409).json({
                error: `"${questionSet.questions[questionIndex].questionType}" `
                     + `type question can't accept multiple answers`
            });
        }

        // Находим уже существующий ответ
        [err, answer] = await to(
            Questionnaire.Answer.findOne({
                studentId: req.account._id,
                setNumber: req.params.setNumber,
                questionNumber: req.params.questionNumber,
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        if (!answer) {
            // Если ответ не существует, то создаем новый
            answer = await new Questionnaire.Answer({
                studentId: req.account._id,
                setNumber: req.params.setNumber,
                questionNumber: req.params.questionNumber,
                answers: req.body.answers,
            });

            await answer.save();
            return res.status(200).json({ status: "ok" });
        }

        // Меняем его, если он существует
        answer.answers = req.body.answers;
        await answer.save();

        return res.status(200).json({ status: "ok" });
    },

    // Вернуть ответ студента на вопрос
    //
    // GET /student/questionnaire/answer/:studentId/:setNumber/:questionNumber
    getQuestionnaireAnswer: async (req, res, next) => {
        var err, answer;

        // Находим ответ
        [err, answer] = await to(
            Questionnaire.Answer.findOne({
                studentId: req.params.studentId,
                setNumber: req.params.setNumber,
                questionNumber: req.params.questionNumber,
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Если студент не ответил, возвращаем соответствующее сообщение
        if (!answer) {
            return res.status(400).json({ error: "Student didn't answer this question" });
        }
        return res.status(200).json({ answers: answer.answers });
    },

    // Вернуть ответы студента на вопросы в сете
    //
    // GET /student/questionnaire/set-answers/:studentId/:setNumber
    getQuestionnaireSetAnswers: async (req, res, next) => {
        var err, answers;

        // Находим ответ
        [err, answers] = await to(
            Questionnaire.Answer.find({
                studentId: req.params.studentId,
                setNumber: req.params.setNumber,
            }).sort({questionNumber: 1})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        return res.status(200).json({ answers });
    },

    // Вернуть все ответы студента на вопросы
    //
    // GET /student/questionnaire/all-answers/:studentId
    getAllQuestionnaireAnswers: async (req, res, next) => {
        var err, answers;

        // Находим ответ
        [err, answers] = await to(
            Questionnaire.Answer.find({
                studentId: req.params.studentId,
            }).sort({setNumber: 1, questionNumber: 1})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        return res.status(200).json({answers});
    },
};
