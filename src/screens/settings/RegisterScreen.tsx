import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { globalStyles } from '@/styles';
import { Card } from '@/components';
import { memberService } from '@/services';

type RegisterScreenNavigationProp = StackNavigationProp<any>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  // 중복체크 상태
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);

  // 검증 오류 모달
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // 정보 모달 (중복확인 결과 등)
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalMessage, setInfoModalMessage] = useState('');

  // 비밀번호 조건 검증 상태
  const passwordMinLength = password.length >= 8;
  const passwordHasLetter = /[a-zA-Z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === passwordConfirm;

  // 이메일 형식 검증
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 아이디 중복 체크
  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setUsernameChecked(true);
      setUsernameAvailable(false);
      setUsernameErrorMessage('아이디를 입력해주세요');
      return;
    }

    if (username.length < 4 || username.length > 20) {
      setUsernameChecked(true);
      setUsernameAvailable(false);
      setUsernameErrorMessage('아이디는 4-20자 사이여야 합니다');
      return;
    }

    setCheckingUsername(true);
    try {
      const exists = await memberService.checkUsername(username);
      setUsernameChecked(true);
      setUsernameAvailable(!exists);
      setUsernameErrorMessage('');
    } catch (error) {
      setUsernameChecked(true);
      setUsernameAvailable(false);
      setUsernameErrorMessage('중복 확인 중 오류가 발생했습니다');
    } finally {
      setCheckingUsername(false);
    }
  };

  // 이메일 중복 체크
  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setEmailChecked(true);
      setEmailAvailable(false);
      setEmailErrorMessage('이메일을 입력해주세요');
      return;
    }

    if (!emailValid) {
      setEmailChecked(true);
      setEmailAvailable(false);
      setEmailErrorMessage('올바른 이메일 형식이 아닙니다');
      return;
    }

    setCheckingEmail(true);
    try {
      const exists = await memberService.checkEmail(email);
      setEmailChecked(true);
      setEmailAvailable(!exists);
      setEmailErrorMessage('');
    } catch (error) {
      setEmailChecked(true);
      setEmailAvailable(false);
      setEmailErrorMessage('중복 확인 중 오류가 발생했습니다');
    } finally {
      setCheckingEmail(false);
    }
  };

  // 닉네임 중복 체크
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      setNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameErrorMessage('닉네임을 입력해주세요');
      return;
    }

    if (nickname.length < 2 || nickname.length > 10) {
      setNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameErrorMessage('닉네임은 2-10자 사이여야 합니다');
      return;
    }

    setCheckingNickname(true);
    try {
      const exists = await memberService.checkNickname(nickname);
      setNicknameChecked(true);
      setNicknameAvailable(!exists);
      setNicknameErrorMessage('');
    } catch (error) {
      setNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameErrorMessage('중복 확인 중 오류가 발생했습니다');
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleRegister = async () => {
    // 검증 실패 항목 수집
    const errors: string[] = [];

    // 1. 입력값 검증
    if (!username.trim()) {
      errors.push('• 아이디를 입력해주세요');
    }
    if (!email.trim()) {
      errors.push('• 이메일을 입력해주세요');
    }
    if (email.trim() && !emailValid) {
      errors.push('• 올바른 이메일 형식이 아닙니다');
    }
    if (!nickname.trim()) {
      errors.push('• 닉네임을 입력해주세요');
    }
    if (!password.trim()) {
      errors.push('• 비밀번호를 입력해주세요');
    }
    if (!passwordConfirm.trim()) {
      errors.push('• 비밀번호 확인을 입력해주세요');
    }

    // 2. 중복체크 확인
    if (username.trim() && (!usernameChecked || !usernameAvailable)) {
      errors.push('• 아이디 중복 확인이 필요합니다');
    }
    if (email.trim() && (!emailChecked || !emailAvailable)) {
      errors.push('• 이메일 중복 확인이 필요합니다');
    }
    if (nickname.trim() && (!nicknameChecked || !nicknameAvailable)) {
      errors.push('• 닉네임 중복 확인이 필요합니다');
    }

    // 3. 비밀번호 검증
    if (password.trim() && password.length < 8) {
      errors.push('• 비밀번호는 8자 이상이어야 합니다');
    }
    if (password.trim() && !passwordHasLetter) {
      errors.push('• 비밀번호는 영문을 포함해야 합니다');
    }
    if (password.trim() && !passwordHasNumber) {
      errors.push('• 비밀번호는 숫자를 포함해야 합니다');
    }
    if (password.trim() && !passwordHasSpecial) {
      errors.push('• 비밀번호는 특수문자를 포함해야 합니다');
    }
    if (
      password.trim() &&
      passwordConfirm.trim() &&
      password !== passwordConfirm
    ) {
      errors.push('• 비밀번호가 일치하지 않습니다');
    }

    // 검증 실패 시 모달 표시
    if (errors.length > 0) {
      setErrorMessages(errors);
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      // 회원가입 API 호출
      const response = await memberService.signup({
        username,
        password,
        nickname,
        email,
      });

      // 회원가입 성공
      setInfoModalTitle('회원가입 완료');
      setInfoModalMessage(
        `${response.nickname}님, 환영합니다!\n로그인 페이지로 이동합니다.`
      );
      setInfoModalVisible(true);

      // 1초 후 로그인 화면으로 이동
      setTimeout(() => {
        setInfoModalVisible(false);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setErrorMessages(['• 회원가입 중 오류가 발생했습니다']);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={globalStyles.container}>
        <View style={globalStyles.content}>
          <Card style={styles.registerCard}>
            {/* 아이디 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>아이디</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChangeText={text => {
                    // 영문만 허용
                    const englishOnly = text.replace(/[^a-zA-Z0-9]/g, '');
                    setUsername(englishOnly);
                    setUsernameChecked(false);
                    setUsernameAvailable(false);
                    setUsernameErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (checkingUsername || usernameAvailable) &&
                      styles.checkButtonDisabled,
                  ]}
                  onPress={handleCheckUsername}
                  disabled={checkingUsername || loading || usernameAvailable}
                >
                  {checkingUsername ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkButtonText}>
                      {usernameAvailable ? '확인완료' : '중복확인'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {usernameChecked && (
                <Text
                  style={[
                    styles.checkResult,
                    usernameAvailable ? styles.checkSuccess : styles.checkError,
                  ]}
                >
                  {usernameAvailable
                    ? '✓ 사용 가능한 아이디입니다'
                    : `✗ ${usernameErrorMessage || '이미 사용 중인 아이디입니다'}`}
                </Text>
              )}
              <Text style={styles.hint}>영문, 숫자만 가능 4-20자</Text>
            </View>

            {/* 이메일 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailChecked(false);
                    setEmailAvailable(false);
                    setEmailErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (checkingEmail || emailAvailable) &&
                      styles.checkButtonDisabled,
                  ]}
                  onPress={handleCheckEmail}
                  disabled={checkingEmail || loading || emailAvailable}
                >
                  {checkingEmail ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkButtonText}>
                      {emailAvailable ? '확인완료' : '중복확인'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {emailChecked && (
                <Text
                  style={[
                    styles.checkResult,
                    emailAvailable ? styles.checkSuccess : styles.checkError,
                  ]}
                >
                  {emailAvailable
                    ? '✓ 사용 가능한 이메일입니다'
                    : `✗ ${emailErrorMessage || '이미 사용 중인 이메일입니다'}`}
                </Text>
              )}
              {/* 이메일 형식 검증 실시간 표시 */}
              {email.length > 0 && !emailChecked && (
                <View style={styles.passwordRequirements}>
                  <View style={styles.requirementItem}>
                    <Text
                      style={[
                        styles.requirementIcon,
                        emailValid && styles.requirementMet,
                      ]}
                    >
                      {emailValid ? '✓' : '○'}
                    </Text>
                    <Text
                      style={[
                        styles.requirementText,
                        emailValid && styles.requirementMetText,
                      ]}
                    >
                      올바른 이메일 형식
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 닉네임 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>닉네임</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChangeText={text => {
                    setNickname(text);
                    setNicknameChecked(false);
                    setNicknameAvailable(false);
                    setNicknameErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (checkingNickname || nicknameAvailable) &&
                      styles.checkButtonDisabled,
                  ]}
                  onPress={handleCheckNickname}
                  disabled={checkingNickname || loading || nicknameAvailable}
                >
                  {checkingNickname ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkButtonText}>
                      {nicknameAvailable ? '확인완료' : '중복확인'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {nicknameChecked && (
                <Text
                  style={[
                    styles.checkResult,
                    nicknameAvailable ? styles.checkSuccess : styles.checkError,
                  ]}
                >
                  {nicknameAvailable
                    ? '✓ 사용 가능한 닉네임입니다'
                    : `✗ ${nicknameErrorMessage || '이미 사용 중인 닉네임입니다'}`}
                </Text>
              )}
              <Text style={styles.hint}>2-10자 이내</Text>
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {/* 비밀번호 조건 실시간 표시 */}
              <View style={styles.passwordRequirements}>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementIcon,
                      passwordMinLength && styles.requirementMet,
                    ]}
                  >
                    {passwordMinLength ? '✓' : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      passwordMinLength && styles.requirementMetText,
                    ]}
                  >
                    8자리 이상
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementIcon,
                      passwordHasLetter &&
                        passwordHasNumber &&
                        passwordHasSpecial &&
                        styles.requirementMet,
                    ]}
                  >
                    {passwordHasLetter &&
                    passwordHasNumber &&
                    passwordHasSpecial
                      ? '✓'
                      : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      passwordHasLetter &&
                        passwordHasNumber &&
                        passwordHasSpecial &&
                        styles.requirementMetText,
                    ]}
                  >
                    영문, 숫자, 특수문자 포함
                  </Text>
                </View>
              </View>
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {/* 비밀번호 일치 여부 실시간 표시 */}
              <View style={styles.passwordRequirements}>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementIcon,
                      passwordsMatch && styles.requirementMet,
                    ]}
                  >
                    {passwordsMatch ? '✓' : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      passwordsMatch && styles.requirementMetText,
                    ]}
                  >
                    비밀번호 일치
                  </Text>
                </View>
              </View>
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>완료</Text>
              )}
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* 정보 모달 (회원가입 성공 등) */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoModalTitle}</Text>
            </View>

            {/* 모달 내용 */}
            <View style={styles.modalBody}>
              <Text style={styles.modalInfoMessage}>{infoModalMessage}</Text>
            </View>

            {/* 모달 버튼 */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 검증 오류 모달 */}
      <Modal
        visible={errorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>회원가입 실패</Text>
            </View>

            {/* 모달 내용 */}
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                다음 항목을 확인해주세요:
              </Text>
              <View style={styles.errorList}>
                {errorMessages.map((error, index) => (
                  <Text key={index} style={styles.errorItem}>
                    {error}
                  </Text>
                ))}
              </View>
            </View>

            {/* 모달 버튼 */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  registerCard: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  inputFlex: {
    flex: 1,
  },
  checkButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  checkResult: {
    fontSize: 12,
    marginTop: 4,
  },
  checkSuccess: {
    color: '#34C759',
  },
  checkError: {
    color: '#FF3B30',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  passwordRequirements: {
    marginTop: 8,
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requirementIcon: {
    fontSize: 14,
    color: '#8E8E93',
  },
  requirementMet: {
    color: '#34C759',
  },
  requirementText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  requirementMetText: {
    color: '#34C759',
  },
  registerButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalInfoMessage: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorList: {
    gap: 8,
  },
  errorItem: {
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
