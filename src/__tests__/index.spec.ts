import reinstaller from '../index'

test('defines init() & create()', () => {
    expect(typeof reinstaller.init).toBe('function')
    expect(typeof reinstaller.create).toBe('function')
})
